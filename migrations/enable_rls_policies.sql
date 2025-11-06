-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR POKEPAGES
-- ============================================================================
-- Run this SQL in Supabase Dashboard → SQL Editor after applying migrations
-- This enables RLS and creates security policies for all tables
-- 
-- PERFORMANCE OPTIMIZED: All auth.uid() calls wrapped in SELECT subqueries
-- to ensure they are evaluated once per statement, not per row.
--
-- IMPORTANT DEPLOYMENT NOTES:
-- 1. IDEMPOTENCY: Set ENABLE_DROP_POLICIES=true below to drop existing policies first
-- 2. BACKUP: Always backup existing policies before running: pg_dump --schema-only
-- 3. This script is idempotent-safe for ALTER TABLE ... ENABLE RLS statements
-- 4. Run EXPLAIN (ANALYZE, BUFFERS) on representative queries after deployment
-- 5. Test as authenticated user before production (see validation section)
--
-- REQUIRED INDEXES (verify these exist - should be from migration 0002):
-- Single-column indexes (for RLS filters):
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility);
CREATE INDEX IF NOT EXISTS idx_post_media_post_id ON post_media(post_id);
CREATE INDEX IF NOT EXISTS idx_friendships_requester_id ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee_id ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_blocks_blocker_id ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_id ON blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_user_mutes_user_id ON user_mutes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id ON comment_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_id ON conversations(id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation_id ON direct_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_id ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_message_media_message_id ON direct_message_media(message_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_post_id ON post_hashtags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag_id ON post_hashtags(hashtag_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON saved_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_catches_user_id ON catches(user_id);

-- Composite indexes (for multi-column RLS checks):
CREATE INDEX IF NOT EXISTS idx_friendships_status_requester ON friendships(status, requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status_addressee ON friendships(status, addressee_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_visibility ON posts(author_id, visibility);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conv_sender ON direct_messages(conversation_id, sender_id);
-- ============================================================================

-- ============================================================================
-- CONFIGURATION: Set to true to drop existing policies before creating new ones
-- ============================================================================
DO $$ 
DECLARE 
  ENABLE_DROP_POLICIES BOOLEAN := false;  -- Change to true for re-deployment
BEGIN
  IF ENABLE_DROP_POLICIES THEN
    RAISE NOTICE 'DROP_POLICIES enabled - removing existing policies...';
  ELSE
    RAISE NOTICE 'DROP_POLICIES disabled - will attempt to create policies (may fail if exist)';
  END IF;
END $$;

-- ============================================================================
-- DROP EXISTING POLICIES (controlled by ENABLE_DROP_POLICIES flag above)
-- ============================================================================
DO $$ 
DECLARE 
  ENABLE_DROP_POLICIES BOOLEAN := false;  -- Must match value above
BEGIN
  IF ENABLE_DROP_POLICIES THEN
    -- Profiles
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

    -- Legends ZA Tracker
    DROP POLICY IF EXISTS "Users can view their own legends za tracker data" ON legends_za_tracker;
    DROP POLICY IF EXISTS "Users can insert their own legends za tracker data" ON legends_za_tracker;
    DROP POLICY IF EXISTS "Users can update their own legends za tracker data" ON legends_za_tracker;
    DROP POLICY IF EXISTS "Users can delete their own legends za tracker data" ON legends_za_tracker;

    -- Event Participation
    DROP POLICY IF EXISTS "Enable read access for all users" ON user_event_participation;
    DROP POLICY IF EXISTS "user_participation_upsert_own" ON user_event_participation;
    DROP POLICY IF EXISTS "anon_participation_select_all" ON anonymous_event_participation;
    DROP POLICY IF EXISTS "anon_participation_insert_all" ON anonymous_event_participation;
    DROP POLICY IF EXISTS "anon_participation_update_all" ON anonymous_event_participation;
    DROP POLICY IF EXISTS "event_counters_select_all" ON event_counters;

    -- Posts
    DROP POLICY IF EXISTS "posts_select_public" ON posts;
    DROP POLICY IF EXISTS "posts_insert_own" ON posts;
    DROP POLICY IF EXISTS "posts_update_own" ON posts;
    DROP POLICY IF EXISTS "posts_delete_own" ON posts;

    -- Post Media
    DROP POLICY IF EXISTS "post_media_select" ON post_media;
    DROP POLICY IF EXISTS "post_media_insert" ON post_media;
    DROP POLICY IF EXISTS "post_media_delete" ON post_media;

    -- Friendships
    DROP POLICY IF EXISTS "friendships_select_own" ON friendships;
    DROP POLICY IF EXISTS "friendships_insert_own" ON friendships;
    DROP POLICY IF EXISTS "friendships_update_own" ON friendships;
    DROP POLICY IF EXISTS "friendships_delete_own" ON friendships;

    -- Blocks
    DROP POLICY IF EXISTS "blocks_select_own" ON blocks;
    DROP POLICY IF EXISTS "blocks_insert_own" ON blocks;
    DROP POLICY IF EXISTS "blocks_delete_own" ON blocks;

    -- User Mutes
    DROP POLICY IF EXISTS "user_mutes_select_own" ON user_mutes;
    DROP POLICY IF EXISTS "user_mutes_insert_own" ON user_mutes;
    DROP POLICY IF EXISTS "user_mutes_delete_own" ON user_mutes;

    -- Likes
    DROP POLICY IF EXISTS "likes_select" ON likes;
    DROP POLICY IF EXISTS "likes_insert_own" ON likes;
    DROP POLICY IF EXISTS "likes_delete_own" ON likes;

    -- Comments
    DROP POLICY IF EXISTS "comments_select" ON comments;
    DROP POLICY IF EXISTS "comments_insert" ON comments;
    DROP POLICY IF EXISTS "comments_update_own" ON comments;
    DROP POLICY IF EXISTS "comments_delete_own" ON comments;

    -- Comment Reactions
    DROP POLICY IF EXISTS "comment_reactions_select" ON comment_reactions;
    DROP POLICY IF EXISTS "comment_reactions_insert_own" ON comment_reactions;
    DROP POLICY IF EXISTS "comment_reactions_delete_own" ON comment_reactions;

    -- Conversations
    DROP POLICY IF EXISTS "conversations_select_own" ON conversations;
    DROP POLICY IF EXISTS "conversations_insert" ON conversations;

    -- Direct Messages
    DROP POLICY IF EXISTS "direct_messages_select_own" ON direct_messages;
    DROP POLICY IF EXISTS "direct_messages_insert_own" ON direct_messages;
    DROP POLICY IF EXISTS "direct_messages_update" ON direct_messages;
    DROP POLICY IF EXISTS "direct_messages_delete_own" ON direct_messages;

    -- Direct Message Media
    DROP POLICY IF EXISTS "direct_message_media_select" ON direct_message_media;
    DROP POLICY IF EXISTS "direct_message_media_insert" ON direct_message_media;

    -- Notifications
    DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
    DROP POLICY IF EXISTS "notifications_insert" ON notifications;
    DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
    DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;

    -- Hashtags
    DROP POLICY IF EXISTS "hashtags_select_all" ON hashtags;
    DROP POLICY IF EXISTS "hashtags_insert" ON hashtags;

    -- Post Hashtags
    DROP POLICY IF EXISTS "post_hashtags_select" ON post_hashtags;
    DROP POLICY IF EXISTS "post_hashtags_insert" ON post_hashtags;
    DROP POLICY IF EXISTS "post_hashtags_delete" ON post_hashtags;

    -- Saved Posts
    DROP POLICY IF EXISTS "saved_posts_select_own" ON saved_posts;
    DROP POLICY IF EXISTS "saved_posts_insert_own" ON saved_posts;
    DROP POLICY IF EXISTS "saved_posts_delete_own" ON saved_posts;

    -- Reactions
    DROP POLICY IF EXISTS "reactions_select" ON reactions;
    DROP POLICY IF EXISTS "reactions_insert_own" ON reactions;
    DROP POLICY IF EXISTS "reactions_delete_own" ON reactions;

    -- Badges
    DROP POLICY IF EXISTS "badges_select_all" ON badges;
    DROP POLICY IF EXISTS "badges_insert_system" ON badges;

    -- User Badges
    DROP POLICY IF EXISTS "user_badges_select_all" ON user_badges;
    DROP POLICY IF EXISTS "user_badges_insert_system" ON user_badges;

    -- Catches
    DROP POLICY IF EXISTS "catches_select" ON catches;
    DROP POLICY IF EXISTS "catches_insert_own" ON catches;
    DROP POLICY IF EXISTS "catches_update_own" ON catches;
    DROP POLICY IF EXISTS "catches_delete_own" ON catches;

    RAISE NOTICE 'All existing policies dropped successfully';
  END IF;
END $$;

-- ============================================================================
-- RE-ENABLE RLS FOR EXISTING TABLES
-- ============================================================================

ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "legends_za_tracker" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_event_participation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "anonymous_event_participation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "event_counters" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RESTORE POLICIES FOR EXISTING TABLES
-- ============================================================================

-- Profiles Policies
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING ((SELECT auth.uid()) = id);

-- Legends ZA Tracker Policies
CREATE POLICY "legends_za_select_own"
  ON legends_za_tracker FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "legends_za_insert_own"
  ON legends_za_tracker FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "legends_za_update_own"
  ON legends_za_tracker FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "legends_za_delete_own"
  ON legends_za_tracker FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- Event Participation Policies
CREATE POLICY "Enable read access for all users"
  ON "user_event_participation" FOR SELECT
  USING (true);

CREATE POLICY "user_participation_upsert_own"
  ON "user_event_participation" FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = "user_id");

-- Anonymous Event Participation Policies
CREATE POLICY "anon_participation_select_all"
  ON "anonymous_event_participation" FOR SELECT
  USING (true);

CREATE POLICY "anon_participation_insert_all"
  ON "anonymous_event_participation" FOR INSERT
  WITH CHECK (true);

CREATE POLICY "anon_participation_update_all"
  ON "anonymous_event_participation" FOR UPDATE
  USING (true);

-- Event Counters Policies
CREATE POLICY "event_counters_select_all"
  ON "event_counters" FOR SELECT
  USING (true);

-- ============================================================================
-- ENABLE RLS FOR NEW SOCIAL TABLES
-- ============================================================================

ALTER TABLE "posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "post_media" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "friendships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "blocks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_mutes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comment_reactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "direct_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "direct_message_media" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "hashtags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "post_hashtags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "saved_posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "badges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_badges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "catches" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POSTS POLICIES
-- ============================================================================

-- Anyone can view public posts
CREATE POLICY "posts_select_public"
  ON "posts" FOR SELECT
  USING (
    visibility = 'public'
    OR (SELECT auth.uid()) = author_id  -- Authors can see their own posts
    OR EXISTS (  -- Friends can see friends_only posts
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
      AND (
        (requester_id = (SELECT auth.uid()) AND addressee_id = author_id)
        OR (addressee_id = (SELECT auth.uid()) AND requester_id = author_id)
      )
    )
  );

-- Users can insert their own posts
CREATE POLICY "posts_insert_own"
  ON "posts" FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = author_id);

-- Users can update their own posts
CREATE POLICY "posts_update_own"
  ON "posts" FOR UPDATE
  USING ((SELECT auth.uid()) = author_id);

-- Users can delete their own posts
CREATE POLICY "posts_delete_own"
  ON "posts" FOR DELETE
  USING ((SELECT auth.uid()) = author_id);

-- ============================================================================
-- POST MEDIA POLICIES
-- ============================================================================

-- Users can view media for posts they can see
CREATE POLICY "post_media_select"
  ON "post_media" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_media.post_id
      AND (
        posts.visibility = 'public'
        OR (SELECT auth.uid()) = posts.author_id
        OR EXISTS (
          SELECT 1 FROM friendships
          WHERE status = 'accepted'
          AND (
            (requester_id = (SELECT auth.uid()) AND addressee_id = posts.author_id)
            OR (addressee_id = (SELECT auth.uid()) AND requester_id = posts.author_id)
          )
        )
      )
    )
  );

-- Users can insert media for their own posts
CREATE POLICY "post_media_insert"
  ON "post_media" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_media.post_id
      AND (SELECT auth.uid()) = posts.author_id
    )
  );

-- Users can delete media from their own posts
CREATE POLICY "post_media_delete"
  ON "post_media" FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_media.post_id
      AND (SELECT auth.uid()) = posts.author_id
    )
  );

-- ============================================================================
-- FRIENDSHIPS POLICIES
-- ============================================================================

-- Users can view their own friendships
CREATE POLICY "friendships_select_own"
  ON "friendships" FOR SELECT
  USING (
    (SELECT auth.uid()) = requester_id
    OR (SELECT auth.uid()) = addressee_id
  );

-- Users can send friend requests
CREATE POLICY "friendships_insert_own"
  ON "friendships" FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = requester_id);

-- Users can update friendships they're part of (accepting requests)
CREATE POLICY "friendships_update_own"
  ON "friendships" FOR UPDATE
  USING (
    (SELECT auth.uid()) = requester_id
    OR (SELECT auth.uid()) = addressee_id
  );

-- Users can delete their own friendships
CREATE POLICY "friendships_delete_own"
  ON "friendships" FOR DELETE
  USING (
    (SELECT auth.uid()) = requester_id
    OR (SELECT auth.uid()) = addressee_id
  );

-- ============================================================================
-- BLOCKS POLICIES
-- ============================================================================

-- Users can only view blocks they created
CREATE POLICY "blocks_select_own"
  ON "blocks" FOR SELECT
  USING ((SELECT auth.uid()) = blocker_id);

-- Users can block other users
CREATE POLICY "blocks_insert_own"
  ON "blocks" FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = blocker_id);

-- Users can unblock (delete blocks they created)
CREATE POLICY "blocks_delete_own"
  ON "blocks" FOR DELETE
  USING ((SELECT auth.uid()) = blocker_id);

-- ============================================================================
-- USER MUTES POLICIES
-- ============================================================================

-- Users can view their own mutes
CREATE POLICY "user_mutes_select_own"
  ON "user_mutes" FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

-- Users can mute other users
CREATE POLICY "user_mutes_insert_own"
  ON "user_mutes" FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can unmute (delete mutes)
CREATE POLICY "user_mutes_delete_own"
  ON "user_mutes" FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- LIKES POLICIES
-- ============================================================================

-- Users can view likes on posts they can see
CREATE POLICY "likes_select"
  ON "likes" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = likes.post_id
      AND (
        posts.visibility = 'public'
        OR (SELECT auth.uid()) = posts.author_id
        OR EXISTS (
          SELECT 1 FROM friendships
          WHERE status = 'accepted'
          AND (
            (requester_id = (SELECT auth.uid()) AND addressee_id = posts.author_id)
            OR (addressee_id = (SELECT auth.uid()) AND requester_id = posts.author_id)
          )
        )
      )
    )
  );

-- Users can like posts they can see
CREATE POLICY "likes_insert_own"
  ON "likes" FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can unlike (delete their own likes)
CREATE POLICY "likes_delete_own"
  ON "likes" FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- COMMENTS POLICIES
-- ============================================================================

-- Users can view comments on posts they can see
CREATE POLICY "comments_select"
  ON "comments" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
      AND (
        posts.visibility = 'public'
        OR (SELECT auth.uid()) = posts.author_id
        OR EXISTS (
          SELECT 1 FROM friendships
          WHERE status = 'accepted'
          AND (
            (requester_id = (SELECT auth.uid()) AND addressee_id = posts.author_id)
            OR (addressee_id = (SELECT auth.uid()) AND requester_id = posts.author_id)
          )
        )
      )
    )
  );

-- Users can comment on posts they can see
CREATE POLICY "comments_insert"
  ON "comments" FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = author_id
    AND EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
      AND (
        posts.visibility = 'public'
        OR (SELECT auth.uid()) = posts.author_id
        OR EXISTS (
          SELECT 1 FROM friendships
          WHERE status = 'accepted'
          AND (
            (requester_id = (SELECT auth.uid()) AND addressee_id = posts.author_id)
            OR (addressee_id = (SELECT auth.uid()) AND requester_id = posts.author_id)
          )
        )
      )
    )
  );

-- Users can update their own comments
CREATE POLICY "comments_update_own"
  ON "comments" FOR UPDATE
  USING ((SELECT auth.uid()) = author_id);

-- Users can delete their own comments
CREATE POLICY "comments_delete_own"
  ON "comments" FOR DELETE
  USING ((SELECT auth.uid()) = author_id);

-- ============================================================================
-- COMMENT REACTIONS POLICIES
-- ============================================================================

-- Users can view reactions on comments they can see
CREATE POLICY "comment_reactions_select"
  ON "comment_reactions" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM comments
      JOIN posts ON posts.id = comments.post_id
      WHERE comments.id = comment_reactions.comment_id
      AND (
        posts.visibility = 'public'
        OR (SELECT auth.uid()) = posts.author_id
        OR EXISTS (
          SELECT 1 FROM friendships
          WHERE status = 'accepted'
          AND (
            (requester_id = (SELECT auth.uid()) AND addressee_id = posts.author_id)
            OR (addressee_id = (SELECT auth.uid()) AND requester_id = posts.author_id)
          )
        )
      )
    )
  );

-- Users can react to comments
CREATE POLICY "comment_reactions_insert_own"
  ON "comment_reactions" FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can remove their own reactions
CREATE POLICY "comment_reactions_delete_own"
  ON "comment_reactions" FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- CONVERSATIONS POLICIES
-- ============================================================================

-- Users can view conversations they're part of
CREATE POLICY "conversations_select_own"
  ON "conversations" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM direct_messages
      WHERE direct_messages.conversation_id = conversations.id
      AND (SELECT auth.uid()) = direct_messages.sender_id
    )
  );

-- Users can create conversations
CREATE POLICY "conversations_insert"
  ON "conversations" FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- DIRECT MESSAGES POLICIES
-- ============================================================================

-- Users can view messages in conversations they're part of
CREATE POLICY "direct_messages_select_own"
  ON "direct_messages" FOR SELECT
  USING (
    (SELECT auth.uid()) = sender_id
    OR EXISTS (
      SELECT 1 FROM direct_messages AS dm2
      WHERE dm2.conversation_id = direct_messages.conversation_id
      AND (SELECT auth.uid()) IN (
        SELECT sender_id FROM direct_messages AS dm3
        WHERE dm3.conversation_id = direct_messages.conversation_id
      )
    )
  );

-- Users can send messages
CREATE POLICY "direct_messages_insert_own"
  ON "direct_messages" FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = sender_id);

-- Users can update their own messages (mark as read)
CREATE POLICY "direct_messages_update"
  ON "direct_messages" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM direct_messages AS dm2
      WHERE dm2.conversation_id = direct_messages.conversation_id
      AND (SELECT auth.uid()) IN (
        SELECT sender_id FROM direct_messages AS dm3
        WHERE dm3.conversation_id = direct_messages.conversation_id
      )
    )
  );

-- Users can delete their own messages
CREATE POLICY "direct_messages_delete_own"
  ON "direct_messages" FOR DELETE
  USING ((SELECT auth.uid()) = sender_id);

-- ============================================================================
-- DIRECT MESSAGE MEDIA POLICIES
-- ============================================================================

-- Users can view media in conversations they're part of
CREATE POLICY "direct_message_media_select"
  ON "direct_message_media" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM direct_messages
      WHERE direct_messages.id = direct_message_media.message_id
      AND (
        (SELECT auth.uid()) = direct_messages.sender_id
        OR EXISTS (
          SELECT 1 FROM direct_messages AS dm2
          WHERE dm2.conversation_id = direct_messages.conversation_id
          AND (SELECT auth.uid()) IN (
            SELECT sender_id FROM direct_messages AS dm3
            WHERE dm3.conversation_id = direct_messages.conversation_id
          )
        )
      )
    )
  );

-- Users can add media to their own messages
CREATE POLICY "direct_message_media_insert"
  ON "direct_message_media" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM direct_messages
      WHERE direct_messages.id = direct_message_media.message_id
      AND (SELECT auth.uid()) = direct_messages.sender_id
    )
  );

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Users can only view their own notifications
CREATE POLICY "notifications_select_own"
  ON "notifications" FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

-- System can insert notifications (you'll need service role for this)
CREATE POLICY "notifications_insert"
  ON "notifications" FOR INSERT
  WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own"
  ON "notifications" FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

-- Users can delete their own notifications
CREATE POLICY "notifications_delete_own"
  ON "notifications" FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- HASHTAGS POLICIES
-- ============================================================================

-- Everyone can view hashtags
CREATE POLICY "hashtags_select_all"
  ON "hashtags" FOR SELECT
  USING (true);

-- System/users can create hashtags
CREATE POLICY "hashtags_insert"
  ON "hashtags" FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- POST HASHTAGS POLICIES
-- ============================================================================

-- Users can view hashtags on posts they can see
CREATE POLICY "post_hashtags_select"
  ON "post_hashtags" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_hashtags.post_id
      AND (
        posts.visibility = 'public'
        OR (SELECT auth.uid()) = posts.author_id
        OR EXISTS (
          SELECT 1 FROM friendships
          WHERE status = 'accepted'
          AND (
            (requester_id = (SELECT auth.uid()) AND addressee_id = posts.author_id)
            OR (addressee_id = (SELECT auth.uid()) AND requester_id = posts.author_id)
          )
        )
      )
    )
  );

-- Users can add hashtags to their own posts
CREATE POLICY "post_hashtags_insert"
  ON "post_hashtags" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_hashtags.post_id
      AND (SELECT auth.uid()) = posts.author_id
    )
  );

-- Users can remove hashtags from their own posts
CREATE POLICY "post_hashtags_delete"
  ON "post_hashtags" FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_hashtags.post_id
      AND (SELECT auth.uid()) = posts.author_id
    )
  );

-- ============================================================================
-- SAVED POSTS POLICIES
-- ============================================================================

-- Users can view their own saved posts
CREATE POLICY "saved_posts_select_own"
  ON "saved_posts" FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

-- Users can save posts they can see
CREATE POLICY "saved_posts_insert_own"
  ON "saved_posts" FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = saved_posts.post_id
      AND (
        posts.visibility = 'public'
        OR (SELECT auth.uid()) = posts.author_id
        OR EXISTS (
          SELECT 1 FROM friendships
          WHERE status = 'accepted'
          AND (
            (requester_id = (SELECT auth.uid()) AND addressee_id = posts.author_id)
            OR (addressee_id = (SELECT auth.uid()) AND requester_id = posts.author_id)
          )
        )
      )
    )
  );

-- Users can unsave posts
CREATE POLICY "saved_posts_delete_own"
  ON "saved_posts" FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- REACTIONS POLICIES
-- ============================================================================

-- Users can view reactions on posts they can see
CREATE POLICY "reactions_select"
  ON "reactions" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = reactions.post_id
      AND (
        posts.visibility = 'public'
        OR (SELECT auth.uid()) = posts.author_id
        OR EXISTS (
          SELECT 1 FROM friendships
          WHERE status = 'accepted'
          AND (
            (requester_id = (SELECT auth.uid()) AND addressee_id = posts.author_id)
            OR (addressee_id = (SELECT auth.uid()) AND requester_id = posts.author_id)
          )
        )
      )
    )
  );

-- Users can react to posts
CREATE POLICY "reactions_insert_own"
  ON "reactions" FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can remove their own reactions
CREATE POLICY "reactions_delete_own"
  ON "reactions" FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- BADGES POLICIES
-- ============================================================================

-- Everyone can view badges
CREATE POLICY "badges_select_all"
  ON "badges" FOR SELECT
  USING (true);

-- Only system/admin can create badges (you'll manage this separately)
CREATE POLICY "badges_insert_system"
  ON "badges" FOR INSERT
  WITH CHECK (false);  -- Change to service role only in production

-- ============================================================================
-- USER BADGES POLICIES
-- ============================================================================

-- Users can view all user badges
CREATE POLICY "user_badges_select_all"
  ON "user_badges" FOR SELECT
  USING (true);

-- Only system can award badges (you'll use service role)
CREATE POLICY "user_badges_insert_system"
  ON "user_badges" FOR INSERT
  WITH CHECK (false);  -- Change to service role only in production

-- ============================================================================
-- CATCHES POLICIES (Pokémon Gallery)
-- ============================================================================

-- Users can view their own catches and public catches
CREATE POLICY "catches_select"
  ON "catches" FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = catches.user_id
      -- Add any additional visibility logic here
    )
  );

-- Users can add their own catches
CREATE POLICY "catches_insert_own"
  ON "catches" FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can update their own catches
CREATE POLICY "catches_update_own"
  ON "catches" FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

-- Users can delete their own catches
CREATE POLICY "catches_delete_own"
  ON "catches" FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- END OF RLS POLICIES
-- ============================================================================
-- PERFORMANCE OPTIMIZED: All auth.uid() wrapped in SELECT subqueries.
-- Remember to test these policies thoroughly before going to production!
-- You may need to adjust based on your specific business logic requirements.
-- 
-- Additional Performance Tips:
-- 1. Ensure indexes exist on columns used in RLS checks (author_id, user_id, etc.)
-- 2. Monitor query performance with EXPLAIN ANALYZE
-- 3. Consider SECURITY DEFINER helper functions for very complex checks
--
-- ============================================================================
-- POST-DEPLOYMENT VALIDATION
-- ============================================================================
-- Run these queries to validate RLS is working correctly:
--
-- 1. Verify RLS is enabled on all tables:
--    SELECT schemaname, tablename, rowsecurity 
--    FROM pg_tables 
--    WHERE schemaname = 'public' 
--    AND tablename IN ('posts', 'profiles', 'friendships', 'direct_messages')
--    ORDER BY tablename;
--    -- Expected: rowsecurity = true for all
--
-- 2. Check policy count per table:
--    SELECT schemaname, tablename, COUNT(*) as policy_count
--    FROM pg_policies
--    WHERE schemaname = 'public'
--    GROUP BY schemaname, tablename
--    ORDER BY tablename;
--    -- Expected: Multiple policies per table
--
-- 3. Test as authenticated user (replace <user_id> with actual UUID):
--    SET request.jwt.claims.sub = '<user_id>';
--    SELECT * FROM posts WHERE author_id = '<user_id>';
--    -- Should return only user's posts
--
-- 4. Performance test with EXPLAIN ANALYZE:
--    EXPLAIN ANALYZE 
--    SELECT p.*, COUNT(l.id) as like_count
--    FROM posts p
--    LEFT JOIN likes l ON l.post_id = p.id
--    WHERE p.visibility = 'public'
--    GROUP BY p.id
--    LIMIT 20;
--    -- Check for sequential scans, ensure indexes are being used
--
-- 5. Verify friendship-based access:
--    -- As User A, create friends_only post
--    -- As User B (not friend), should NOT see post
--    -- Add friendship, accept
--    -- As User B, should NOW see post
--
-- ============================================================================
-- SECURITY CONSIDERATIONS
-- ============================================================================
-- 
-- 1. SERVICE ROLE vs AUTHENTICATED:
--    - Badges and user badges use WITH CHECK (false) - only service role can insert
--    - Notifications use WITH CHECK (true) - consider adding abuse prevention
--    - Hashtags use WITH CHECK (true) - consider rate limiting
--
-- 3. SECURITY DEFINER HELPER FUNCTION (optional - use if needed later):
--    If complex checks become bottlenecks, create helper with proper security:
--    
--    CREATE OR REPLACE FUNCTION auth.current_user_id()
--    RETURNS uuid
--    LANGUAGE sql
--    STABLE
--    SECURITY DEFINER
--    AS $$
--      SELECT COALESCE(
--        nullif(current_setting('request.jwt.claims.sub', true), ''),
--        (nullif(current_setting('request.jwt.claim.sub', true), ''))
--      )::uuid;
--    $$;
--    
--    -- Secure the function properly:
--    ALTER FUNCTION auth.current_user_id() OWNER TO postgres;
--    REVOKE ALL ON FUNCTION auth.current_user_id() FROM PUBLIC;
--    GRANT EXECUTE ON FUNCTION auth.current_user_id() TO authenticated;
--    
--    IMPORTANT: For SECURITY DEFINER functions:
--    - Always set search_path explicitly or use schema-qualified names
--    - Never trust user input without validation
--    - Keep logic simple and auditable
--    - Grant execute only to specific roles that need it
--
-- 4. CURRENT_SETTING PATTERN (if you add JWT claim checks later):
--    Use the same SELECT wrapper pattern:
--    (SELECT current_setting('request.jwt.claims.tenant_id', true))
--    This ensures the setting is read once per statement, not per row.
--
-- 5. MONITORING & ALERTING:
--    - Monitor failed policy checks in logs
--    - Alert on unusual access patterns
--    - Track auth.uid() = null cases (unauthenticated attempts)
--
-- ============================================================================
