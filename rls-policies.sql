-- RLS Policies for event_counters table
-- This allows the increment_counter function to work properly

-- Create policy to allow INSERT for event_counters
CREATE POLICY "Allow insert for event counters" ON event_counters
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy to allow UPDATE for event_counters  
CREATE POLICY "Allow update for event counters" ON event_counters
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policy to allow SELECT for event_counters (if not already exists)
CREATE POLICY "Allow select for event counters" ON event_counters
  FOR SELECT
  TO public
  USING (true);

-- Also need policies for user_event_participation table
CREATE POLICY "Allow insert for user participation" ON user_event_participation
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow update for user participation" ON user_event_participation
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow select for user participation" ON user_event_participation
  FOR SELECT
  TO public
  USING (true);

-- And for anonymous_event_participation table
CREATE POLICY "Allow insert for anonymous participation" ON anonymous_event_participation
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow update for anonymous participation" ON anonymous_event_participation
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow select for anonymous participation" ON anonymous_event_participation
  FOR SELECT
  TO public
  USING (true);
