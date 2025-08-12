-- Final corrected increment_counter function
-- This uses standard parameter names and fixes all issues

DROP FUNCTION IF EXISTS increment_counter(TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS increment_counter(TEXT, TEXT, UUID, TEXT);

CREATE OR REPLACE FUNCTION increment_counter(
  p_event_key TEXT,
  p_pokemon_name TEXT,
  p_user_id UUID DEFAULT NULL,
  p_anonymous_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER  -- Changed from INVOKER to DEFINER to bypass RLS
AS $$
DECLARE
  v_current_count INTEGER := 0;
  v_user_count INTEGER := 1;
  v_event_id UUID;
  v_updated_at TIMESTAMP;
BEGIN
  -- Debug logging
  RAISE NOTICE 'increment_counter called with: event_key=%, pokemon_name=%, user_id=%, anonymous_id=%', p_event_key, p_pokemon_name, p_user_id, p_anonymous_id;

  -- Insert or update event counter with explicit column handling
  WITH upsert AS (
    INSERT INTO event_counters AS ec (event_key, pokemon_name, total_count, created_at, updated_at)
    VALUES (p_event_key, p_pokemon_name, 1, NOW(), NOW())
    ON CONFLICT (event_key) 
    DO UPDATE SET 
      total_count = ec.total_count + 1,
      updated_at = NOW()
    RETURNING ec.total_count, ec.id, ec.updated_at
  )
  SELECT total_count, id, updated_at 
  INTO v_current_count, v_event_id, v_updated_at 
  FROM upsert;
  
  RAISE NOTICE 'Event counter updated: count=%, id=%', v_current_count, v_event_id;
  
  -- Handle user participation tracking
  IF p_user_id IS NOT NULL THEN
    RAISE NOTICE 'Processing authenticated user: %', p_user_id;
    -- For authenticated users
    WITH upsert AS (
      INSERT INTO user_event_participation AS uep (event_id, user_id, contribution_count, last_contributed_at)
      VALUES (v_event_id, p_user_id, 1, NOW())
      ON CONFLICT (event_id, user_id)
      DO UPDATE SET 
        contribution_count = uep.contribution_count + 1,
        last_contributed_at = NOW()
      RETURNING uep.contribution_count
    )
    SELECT contribution_count INTO v_user_count FROM upsert;
    
    RAISE NOTICE 'User participation updated: count=%', v_user_count;

  ELSIF p_anonymous_id IS NOT NULL THEN
    RAISE NOTICE 'Processing anonymous user: %', p_anonymous_id;
    -- For anonymous users
    WITH upsert AS (
      INSERT INTO anonymous_event_participation AS aep (event_id, anonymous_id, contribution_count, last_contributed_at)
      VALUES (v_event_id, p_anonymous_id, 1, NOW())
      ON CONFLICT (event_id, anonymous_id)
      DO UPDATE SET 
        contribution_count = aep.contribution_count + 1,
        last_contributed_at = NOW()
      RETURNING aep.contribution_count
    )
    SELECT contribution_count INTO v_user_count FROM upsert;
    
    RAISE NOTICE 'Anonymous participation updated: count=%', v_user_count;
  END IF;
  
  -- Return response with correct field names
  RETURN json_build_object(
    'success', true,
    'event_counter', json_build_object(
      'current_count', v_current_count,
      'updated_at', v_updated_at
    ),
    'user_contribution', v_user_count
  );
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in increment_counter: % %', SQLSTATE, SQLERRM;
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'sqlstate', SQLSTATE
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION increment_counter(TEXT, TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_counter(TEXT, TEXT, UUID, TEXT) TO anon;
