-- Create the increment_event_counter RPC function
-- This function safely increments the event counter and tracks user participation

-- Drop existing function if it exists (with any signature)
DROP FUNCTION IF EXISTS increment_event_counter(TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS increment_event_counter(TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS increment_event_counter;

CREATE FUNCTION increment_event_counter(
  p_event_key TEXT,
  p_user_id UUID DEFAULT NULL,
  p_anonymous_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_record RECORD;
  v_participation_record RECORD;
  v_result JSON;
BEGIN
  -- Get or create the event counter record
  SELECT * INTO v_event_record
  FROM event_counters
  WHERE event_key = p_event_key;
  
  -- If event doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO event_counters (event_key, current_count, created_at, updated_at)
    VALUES (p_event_key, 0, NOW(), NOW())
    RETURNING * INTO v_event_record;
  END IF;
  
  -- Handle authenticated user participation
  IF p_user_id IS NOT NULL THEN
    -- Check if user has already participated
    SELECT * INTO v_participation_record
    FROM user_event_participation
    WHERE event_id = v_event_record.id AND user_id = p_user_id;
    
    IF FOUND THEN
      -- Update existing participation
      UPDATE user_event_participation
      SET contribution_count = contribution_count + 1,
          last_contribution_at = NOW()
      WHERE event_id = v_event_record.id AND user_id = p_user_id
      RETURNING * INTO v_participation_record;
    ELSE
      -- Create new participation record
      INSERT INTO user_event_participation (
        event_id, user_id, contribution_count, first_contribution_at, last_contribution_at
      )
      VALUES (
        v_event_record.id, p_user_id, 1, NOW(), NOW()
      )
      RETURNING * INTO v_participation_record;
    END IF;
    
  -- Handle anonymous user participation
  ELSIF p_anonymous_id IS NOT NULL THEN
    -- Check if anonymous user has already participated
    SELECT * INTO v_participation_record
    FROM anonymous_event_participation
    WHERE event_id = v_event_record.id AND anonymous_id = p_anonymous_id;
    
    IF FOUND THEN
      -- Update existing participation
      UPDATE anonymous_event_participation
      SET contribution_count = contribution_count + 1,
          last_contribution_at = NOW()
      WHERE event_id = v_event_record.id AND anonymous_id = p_anonymous_id
      RETURNING * INTO v_participation_record;
    ELSE
      -- Create new participation record
      INSERT INTO anonymous_event_participation (
        event_id, anonymous_id, contribution_count, first_contribution_at, last_contribution_at
      )
      VALUES (
        v_event_record.id, p_anonymous_id, 1, NOW(), NOW()
      )
      RETURNING * INTO v_participation_record;
    END IF;
  END IF;
  
  -- Increment the global counter
  UPDATE event_counters
  SET current_count = current_count + 1,
      updated_at = NOW()
  WHERE id = v_event_record.id
  RETURNING * INTO v_event_record;
  
  -- Return the result
  SELECT json_build_object(
    'success', true,
    'event_counter', row_to_json(v_event_record),
    'user_contribution', CASE 
      WHEN p_user_id IS NOT NULL THEN v_participation_record.contribution_count
      WHEN p_anonymous_id IS NOT NULL THEN v_participation_record.contribution_count
      ELSE 0
    END
  ) INTO v_result;
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  -- Return error information
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'error_code', SQLSTATE
  );
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION increment_event_counter TO authenticated;
GRANT EXECUTE ON FUNCTION increment_event_counter TO anon;
