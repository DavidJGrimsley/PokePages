-- Add social_link column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_link TEXT;

-- Add comment
COMMENT ON COLUMN profiles.social_link IS 'URL to one social media platform of user''s choice';
