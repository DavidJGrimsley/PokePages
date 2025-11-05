-- ============================================================================
-- MIGRATION: Add Media Support to Social Features
-- Description: Add image and video upload capabilities to posts and messages
-- Date: 2024
-- ============================================================================

-- Add media columns to posts table
-- ============================================================================

-- Remove old single image column (if exists)
ALTER TABLE posts DROP COLUMN IF EXISTS image_url;

-- Add new media columns
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_urls text[];
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_duration integer;

-- Add check constraint for video duration (max 30 seconds)
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_video_duration_check;
ALTER TABLE posts ADD CONSTRAINT posts_video_duration_check 
  CHECK (video_duration IS NULL OR (video_duration > 0 AND video_duration <= 30));

-- Add check constraint to ensure either images OR video, not both
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_media_type_check;
ALTER TABLE posts ADD CONSTRAINT posts_media_type_check
  CHECK (
    (image_urls IS NULL OR array_length(image_urls, 1) IS NULL OR array_length(image_urls, 1) = 0 OR video_url IS NULL)
  );

COMMENT ON COLUMN posts.image_urls IS 'Array of image URLs, maximum 5 images per post';
COMMENT ON COLUMN posts.video_url IS 'Single video URL, mutually exclusive with images';
COMMENT ON COLUMN posts.video_duration IS 'Video duration in seconds, maximum 30 seconds';

-- Add media columns to messages table
-- ============================================================================

ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_urls text[];
ALTER TABLE messages ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS video_duration integer;

-- Add check constraint for video duration (max 30 seconds)
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_video_duration_check;
ALTER TABLE messages ADD CONSTRAINT messages_video_duration_check 
  CHECK (video_duration IS NULL OR (video_duration > 0 AND video_duration <= 30));

-- Add check constraint to ensure either images OR video, not both
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_media_type_check;
ALTER TABLE messages ADD CONSTRAINT messages_media_type_check
  CHECK (
    (image_urls IS NULL OR array_length(image_urls, 1) IS NULL OR array_length(image_urls, 1) = 0 OR video_url IS NULL)
  );

COMMENT ON COLUMN messages.image_urls IS 'Array of image URLs, maximum 5 images per message';
COMMENT ON COLUMN messages.video_url IS 'Single video URL, mutually exclusive with images';
COMMENT ON COLUMN messages.video_duration IS 'Video duration in seconds, maximum 30 seconds';

-- Update RLS policies if needed
-- ============================================================================

-- Ensure users can only update/delete their own media posts
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid()::uuid = author_id)
  WITH CHECK (auth.uid()::uuid = author_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid()::uuid = author_id);

-- Ensure users can only send/delete their own media messages
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid()::uuid = sender_id);

DROP POLICY IF EXISTS "Users can delete own messages" ON messages;
CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  USING (auth.uid()::uuid = sender_id);

-- Create indexes for better query performance
-- ============================================================================

-- Index for posts with images
CREATE INDEX IF NOT EXISTS posts_with_images_idx 
  ON posts USING GIN(image_urls) 
  WHERE image_urls IS NOT NULL AND array_length(image_urls, 1) > 0;

-- Index for posts with videos
CREATE INDEX IF NOT EXISTS posts_with_videos_idx 
  ON posts (video_url) 
  WHERE video_url IS NOT NULL;

-- Index for messages with images
CREATE INDEX IF NOT EXISTS messages_with_images_idx 
  ON messages USING GIN(image_urls) 
  WHERE image_urls IS NOT NULL AND array_length(image_urls, 1) > 0;

-- Index for messages with videos
CREATE INDEX IF NOT EXISTS messages_with_videos_idx 
  ON messages (video_url) 
  WHERE video_url IS NOT NULL;

-- Verify migration
-- ============================================================================

-- Check posts table structure
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'image_urls'
  ) THEN
    RAISE EXCEPTION 'Migration failed: image_urls column not found in posts table';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'video_url'
  ) THEN
    RAISE EXCEPTION 'Migration failed: video_url column not found in posts table';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'image_urls'
  ) THEN
    RAISE EXCEPTION 'Migration failed: image_urls column not found in messages table';
  END IF;

  RAISE NOTICE 'Migration completed successfully!';
END $$;

-- Sample queries to test
-- ============================================================================

-- Test inserting a post with images
-- INSERT INTO posts (author_id, content, image_urls, visibility)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Check out these Pokemon!', 
--         ARRAY['https://example.com/image1.jpg', 'https://example.com/image2.jpg'], 
--         'public');

-- Test inserting a post with video
-- INSERT INTO posts (author_id, content, video_url, video_duration, visibility)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Epic battle video!', 
--         'https://example.com/video.mp4', 25, 'public');

-- Test constraint (should fail - both images AND video)
-- INSERT INTO posts (author_id, content, image_urls, video_url, visibility)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'This should fail', 
--         ARRAY['https://example.com/image1.jpg'], 
--         'https://example.com/video.mp4', 
--         'public');

-- Query posts with media
-- SELECT id, content, image_urls, video_url, video_duration
-- FROM posts
-- WHERE image_urls IS NOT NULL OR video_url IS NOT NULL
-- ORDER BY created_at DESC
-- LIMIT 10;
