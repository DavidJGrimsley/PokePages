-- Migration: Add favorite_features table
-- Run with drizzle-kit or psql as part of your migration workflow
CREATE TABLE IF NOT EXISTS favorite_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  feature_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT favorite_features_unique_user_feature UNIQUE (user_id, feature_key)
);
CREATE INDEX IF NOT EXISTS favorite_features_user_idx ON favorite_features(user_id);
CREATE INDEX IF NOT EXISTS favorite_features_key_idx ON favorite_features(feature_key);

-- (Optional) Enable RLS & create policies in the main RLS migration file
-- ALTER TABLE favorite_features ENABLE ROW LEVEL SECURITY;
