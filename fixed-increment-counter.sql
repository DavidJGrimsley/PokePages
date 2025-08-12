-- Fixed increment_counter function
-- This addresses the column name and data type issues

DROP FUNCTION IF EXISTS increment_counter(TEXT, UUID, TEXT);

CREATE OR REPLACE FUNCTION increment_counter(
  event_key TEXT,  -- Changed back to event_key from p_event_key
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
  v_event_id UUID;  -- Changed from INTEGER to UUID
  v_event_record RECORD;
BEGIN
  -- Debug logging
  RAISE NOTICE 'increment_counter called with: event_key=%, user_id=%, anonymous_id=%', event_key, user_id, anonymous_id;
  
  -- Insert or update event counter (using total_count to match your schema)
  INSERT INTO event_counters (event_key, total_count, created_at, updated_at)
  VALUES (event_key, 1, NOW(), NOW())
  ON CONFLICT (event_key) 
  DO UPDATE SET 
    total_count = event_counters.total_count + 1,  -- Changed from current_count to total_count
    updated_at = NOW()
  RETURNING total_count, id, updated_at INTO v_current_count, v_event_id, v_event_record;
  
  RAISE NOTICE 'Event counter updated: count=%, id=%', v_current_count, v_event_id;
  
  -- Handle user participation tracking
  IF user_id IS NOT NULL THEN
    RAISE NOTICE 'Processing authenticated user: %', user_id;
    -- For authenticated users
    INSERT INTO user_event_participation (event_id, user_id, contribution_count, first_contribution_at, last_contribution_at)
    VALUES (v_event_id, user_id, 1, NOW(), NOW())
    ON CONFLICT (event_id, user_id)
    DO UPDATE SET 
      contribution_count = user_event_participation.contribution_count + 1,
      last_contribution_at = NOW()
    RETURNING contribution_count INTO v_user_count;
    
    RAISE NOTICE 'User participation updated: count=%', v_user_count;
    
  ELSIF anonymous_id IS NOT NULL THEN
    RAISE NOTICE 'Processing anonymous user: %', anonymous_id;
    -- For anonymous users
    INSERT INTO anonymous_event_participation (event_id, anonymous_id, contribution_count, first_contribution_at, last_contribution_at)
    VALUES (v_event_id, anonymous_id, 1, NOW(), NOW())
    ON CONFLICT (event_id, anonymous_id)
    DO UPDATE SET 
      contribution_count = anonymous_event_participation.contribution_count + 1,
      last_contribution_at = NOW()
    RETURNING contribution_count INTO v_user_count;
    
    RAISE NOTICE 'Anonymous participation updated: count=%', v_user_count;
  END IF;
  
  -- Return response with correct field names
  RETURN json_build_object(
    'success', true,
    'event_counter', json_build_object(
      'current_count', v_current_count,
      'updated_at', NOW()
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
GRANT EXECUTE ON FUNCTION increment_counter(TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_counter(TEXT, UUID, TEXT) TO anon;
