-- Create user_event_claims table for tracking which events users have claimed/redeemed
-- Used for tera raids, mystery gifts, promo codes (not participation counters)

CREATE TABLE IF NOT EXISTS user_event_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_key TEXT NOT NULL,
  claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_event_claims_user_id_event_key_key UNIQUE (user_id, event_key)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_event_claims_user_id ON user_event_claims(user_id);

-- Create index on event_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_event_claims_event_key ON user_event_claims(event_key);

-- Enable RLS
ALTER TABLE user_event_claims ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own claims
CREATE POLICY "Users can view their own event claims"
  ON user_event_claims
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own claims
CREATE POLICY "Users can insert their own event claims"
  ON user_event_claims
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own claims
CREATE POLICY "Users can update their own event claims"
  ON user_event_claims
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own claims
CREATE POLICY "Users can delete their own event claims"
  ON user_event_claims
  FOR DELETE
  USING (auth.uid() = user_id);
