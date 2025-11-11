ALTER TABLE "profiles" ADD COLUMN "social_link" text;
-- Add comment
COMMENT ON COLUMN profiles.social_link IS 'URL to one social media platform of user''s choice';

