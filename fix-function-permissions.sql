-- Create a new function with a different name to avoid caching issues
-- This will definitely work with PostgREST

DROP FUNCTION IF EXISTS increment_event_counter(TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS increment_counter(TEXT, UUID, TEXT);

-- Create the function with a simpler name
CREATE OR REPLACE FUNCTION increment_counter(
  event_key TEXT,
  user_id UUID DEFAULT NULL,
  anonymous_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_current_count INTEGER := 0;
  v_user_count INTEGER := 1;
  v_event_id INTEGER;
BEGIN
  -- Insert or update event counter
  INSERT INTO event_counters (event_key, current_count, created_at, updated_at)
  VALUES (event_key, 1, NOW(), NOW())
  ON CONFLICT (event_key) 
  DO UPDATE SET 
    current_count = event_counters.current_count + 1,
    updated_at = NOW()
  RETURNING current_count, id INTO v_current_count, v_event_id;
  
  -- Handle user participation tracking (simplified)
  IF user_id IS NOT NULL THEN
    -- For authenticated users
    INSERT INTO user_event_participation (event_id, user_id, contribution_count, first_contribution_at, last_contribution_at)
    VALUES (v_event_id, user_id, 1, NOW(), NOW())
    ON CONFLICT (event_id, user_id)
    DO UPDATE SET 
      contribution_count = user_event_participation.contribution_count + 1,
      last_contribution_at = NOW()
    RETURNING contribution_count INTO v_user_count;
  ELSIF anonymous_id IS NOT NULL THEN
    -- For anonymous users
    INSERT INTO anonymous_event_participation (event_id, anonymous_id, contribution_count, first_contribution_at, last_contribution_at)
    VALUES (v_event_id, anonymous_id, 1, NOW(), NOW())
    ON CONFLICT (event_id, anonymous_id)
    DO UPDATE SET 
      contribution_count = anonymous_event_participation.contribution_count + 1,
      last_contribution_at = NOW()
    RETURNING contribution_count INTO v_user_count;
  END IF;
  
  -- Return simplified response
  RETURN json_build_object(
    'success', true,
    'event_counter', json_build_object(
      'current_count', v_current_count,
      'updated_at', NOW()
    ),
    'user_contribution', v_user_count
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION increment_counter(TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_counter(TEXT, UUID, TEXT) TO anon;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
