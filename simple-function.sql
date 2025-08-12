-- Simple increment function that should work
CREATE OR REPLACE FUNCTION increment_event_counter(
  p_event_key TEXT,
  p_user_id UUID DEFAULT NULL,
  p_anonymous_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_count INTEGER := 0;
  v_user_count INTEGER := 0;
BEGIN
  -- Simple increment logic
  INSERT INTO event_counters (event_key, current_count, created_at, updated_at)
  VALUES (p_event_key, 1, NOW(), NOW())
  ON CONFLICT (event_key) 
  DO UPDATE SET 
    current_count = event_counters.current_count + 1,
    updated_at = NOW()
  RETURNING current_count INTO v_current_count;
  
  -- Return simple response
  RETURN json_build_object(
    'success', true,
    'event_counter', json_build_object(
      'current_count', v_current_count,
      'updated_at', NOW()
    ),
    'user_contribution', 1
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION increment_event_counter TO authenticated;
GRANT EXECUTE ON FUNCTION increment_event_counter TO anon;
