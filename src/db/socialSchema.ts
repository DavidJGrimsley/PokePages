import { 
  pgTable, 
  uuid, 
  timestamp, 
  text, 
  boolean, 
  integer,
  pgEnum,
  index,
  unique,
  check
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { profiles } from "./profilesSchema.js";

// =================================================================
// ENUMS
// =================================================================

export const friendshipStatusEnum = pgEnum('friendship_status', [
  'pending',
  'accepted'
]);

export const postVisibilityEnum = pgEnum('post_visibility', [
  'public',      
  'friends_only'
]);

export const notificationTypeEnum = pgEnum('notification_type', [
  'like',
  'comment',
  'friend_request',
  'friend_accept',
  'system'
]);

export const mediaTypeEnum = pgEnum('media_type', [
  'image',
  'video'
]);

// =================================================================
// TABLES
// =================================================================

// Posts (media moved to separate table)
export const posts = pgTable("posts", {
  id: uuid().primaryKey().defaultRandom(),
  authorId: uuid("author_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  content: text().notNull(),
  visibility: postVisibilityEnum().notNull().default('public'),
  likesCount: integer("likes_count").notNull().default(0),
  commentsCount: integer("comments_count").notNull().default(0),
  sharesCount: integer("shares_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("posts_author_idx").on(table.authorId),
  index("posts_created_at_idx").on(table.createdAt),
  index("posts_visibility_idx").on(table.visibility),
]);

// Post Media (stores Supabase Storage paths)
export const postMedia = pgTable("post_media", {
  id: uuid().primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  storagePath: text("storage_path").notNull(),
  type: mediaTypeEnum().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("post_media_post_idx").on(table.postId),
  check("valid_media_type", sql`type IN ('image', 'video')`),
]);

// Friendships (no longer includes blocked status)
export const friendships = pgTable("friendships", {
  id: uuid().primaryKey().defaultRandom(),
  requesterId: uuid("requester_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  addresseeId: uuid("addressee_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  status: friendshipStatusEnum().notNull().default('pending'),
  message: text(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("friendships_requester_idx").on(table.requesterId),
  index("friendships_addressee_idx").on(table.addresseeId),
  index("friendships_status_idx").on(table.status),
  unique("friendships_unique_pair").on(table.requesterId, table.addresseeId),
]);

// Blocks (separate from friendships)
export const blocks = pgTable("blocks", {
  id: uuid().primaryKey().defaultRandom(),
  blockerId: uuid("blocker_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  blockedId: uuid("blocked_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("blocks_blocker_idx").on(table.blockerId),
  index("blocks_blocked_idx").on(table.blockedId),
  unique("blocks_unique_pair").on(table.blockerId, table.blockedId),
]);

// User Mutes (does not affect friendship)
export const userMutes = pgTable("user_mutes", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  mutedUserId: uuid("muted_user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("user_mutes_user_idx").on(table.userId),
  unique("user_mutes_unique_pair").on(table.userId, table.mutedUserId),
]);

// Likes (with unique constraint)
export const likes = pgTable("likes", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("likes_user_idx").on(table.userId),
  index("likes_post_idx").on(table.postId),
  unique("likes_unique_user_post").on(table.userId, table.postId),
]);

// Comments
export const comments = pgTable("comments", {
  id: uuid().primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  authorId: uuid("author_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  content: text().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("comments_post_idx").on(table.postId),
  index("comments_author_idx").on(table.authorId),
  index("comments_created_at_idx").on(table.createdAt),
]);

// Conversations (for persistent DMs)
export const conversations = pgTable("conversations", {
  id: uuid().primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("conversations_created_at_idx").on(table.createdAt),
]);

// Direct Messages (renamed from messages)
export const directMessages = pgTable("direct_messages", {
  id: uuid().primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: uuid("sender_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  recipientId: uuid("recipient_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  content: text().notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("direct_messages_conversation_idx").on(table.conversationId),
  index("direct_messages_sender_idx").on(table.senderId),
  index("direct_messages_recipient_idx").on(table.recipientId),
  index("direct_messages_created_at_idx").on(table.createdAt),
]);

// Direct Message Media
export const directMessageMedia = pgTable("direct_message_media", {
  id: uuid().primaryKey().defaultRandom(),
  messageId: uuid("message_id").notNull().references(() => directMessages.id, { onDelete: 'cascade' }),
  storagePath: text("storage_path").notNull(),
  type: mediaTypeEnum().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("direct_message_media_message_idx").on(table.messageId),
  check("valid_dm_media_type", sql`type IN ('image', 'video')`),
]);

// Notifications
export const notifications = pgTable("notifications", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum().notNull(),
  relatedId: uuid("related_id"),
  message: text().notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("notifications_user_idx").on(table.userId),
  index("notifications_is_read_idx").on(table.isRead),
  index("notifications_created_at_idx").on(table.createdAt),
]);

// Hashtags (stored lowercase)
export const hashtags = pgTable("hashtags", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  unique("hashtags_name_unique").on(table.name),
  index("hashtags_name_idx").on(table.name),
]);

// Post Hashtags (many-to-many)
export const postHashtags = pgTable("post_hashtags", {
  id: uuid().primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  hashtagId: uuid("hashtag_id").notNull().references(() => hashtags.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("post_hashtags_post_idx").on(table.postId),
  index("post_hashtags_hashtag_idx").on(table.hashtagId),
  unique("post_hashtags_unique_pair").on(table.postId, table.hashtagId),
]);

// Saved Posts
export const savedPosts = pgTable("saved_posts", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("saved_posts_user_idx").on(table.userId),
  index("saved_posts_post_idx").on(table.postId),
  unique("saved_posts_unique_pair").on(table.userId, table.postId),
]);

// Reactions (emoji reactions)
export const reactions = pgTable("reactions", {
  id: uuid().primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  emojiCode: text("emoji_code").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("reactions_post_idx").on(table.postId),
  index("reactions_user_idx").on(table.userId),
  unique("reactions_unique_user_post_emoji").on(table.userId, table.postId, table.emojiCode),
]);

// Comment Reactions (emoji reactions on comments)
export const commentReactions = pgTable("comment_reactions", {
  id: uuid().primaryKey().defaultRandom(),
  commentId: uuid("comment_id").notNull().references(() => comments.id, { onDelete: 'cascade' }),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  emojiCode: text("emoji_code").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("comment_reactions_comment_idx").on(table.commentId),
  index("comment_reactions_user_idx").on(table.userId),
  unique("comment_reactions_unique_user_comment_emoji").on(table.userId, table.commentId, table.emojiCode),
]);


// Badges (gamification)
export const badges = pgTable("badges", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  description: text(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  unique("badges_name_unique").on(table.name),
]);

// User Badges
export const userBadges = pgTable("user_badges", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  badgeId: uuid("badge_id").notNull().references(() => badges.id, { onDelete: 'cascade' }),
  earnedAt: timestamp("earned_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("user_badges_user_idx").on(table.userId),
  index("user_badges_badge_idx").on(table.badgeId),
  unique("user_badges_unique_pair").on(table.userId, table.badgeId),
]);

// Catches (Pokémon gallery)
export const catches = pgTable("catches", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  pokemonId: integer("pokemon_id").notNull(),
  storagePath: text("storage_path").notNull(),
  caughtAt: timestamp("caught_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  notes: text(),
}, (table) => [
  index("catches_user_idx").on(table.userId),
  index("catches_pokemon_idx").on(table.pokemonId),
  index("catches_caught_at_idx").on(table.caughtAt),
]);

// =================================================================
// RELATIONS
// =================================================================

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(profiles, {
    fields: [posts.authorId],
    references: [profiles.id],
  }),
  media: many(postMedia),
  likes: many(likes),
  comments: many(comments),
  hashtags: many(postHashtags),
  reactions: many(reactions),
  savedBy: many(savedPosts),
}));

export const postMediaRelations = relations(postMedia, ({ one }) => ({
  post: one(posts, {
    fields: [postMedia.postId],
    references: [posts.id],
  }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(profiles, {
    fields: [friendships.requesterId],
    references: [profiles.id],
    relationName: 'requester',
  }),
  addressee: one(profiles, {
    fields: [friendships.addresseeId],
    references: [profiles.id],
    relationName: 'addressee',
  }),
}));

export const blocksRelations = relations(blocks, ({ one }) => ({
  blocker: one(profiles, {
    fields: [blocks.blockerId],
    references: [profiles.id],
    relationName: 'blocker',
  }),
  blocked: one(profiles, {
    fields: [blocks.blockedId],
    references: [profiles.id],
    relationName: 'blocked',
  }),
}));

export const userMutesRelations = relations(userMutes, ({ one }) => ({
  user: one(profiles, {
    fields: [userMutes.userId],
    references: [profiles.id],
    relationName: 'muter',
  }),
  mutedUser: one(profiles, {
    fields: [userMutes.mutedUserId],
    references: [profiles.id],
    relationName: 'muted',
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(profiles, {
    fields: [likes.userId],
    references: [profiles.id],
  }),
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(profiles, {
    fields: [comments.authorId],
    references: [profiles.id],
  }),
  reactions: many(commentReactions),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  messages: many(directMessages),
}));

export const directMessagesRelations = relations(directMessages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [directMessages.conversationId],
    references: [conversations.id],
  }),
  sender: one(profiles, {
    fields: [directMessages.senderId],
    references: [profiles.id],
  }),
  media: many(directMessageMedia),
}));

export const directMessageMediaRelations = relations(directMessageMedia, ({ one }) => ({
  message: one(directMessages, {
    fields: [directMessageMedia.messageId],
    references: [directMessages.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(profiles, {
    fields: [notifications.userId],
    references: [profiles.id],
  }),
}));

export const hashtagsRelations = relations(hashtags, ({ many }) => ({
  posts: many(postHashtags),
}));

export const postHashtagsRelations = relations(postHashtags, ({ one }) => ({
  post: one(posts, {
    fields: [postHashtags.postId],
    references: [posts.id],
  }),
  hashtag: one(hashtags, {
    fields: [postHashtags.hashtagId],
    references: [hashtags.id],
  }),
}));

export const savedPostsRelations = relations(savedPosts, ({ one }) => ({
  user: one(profiles, {
    fields: [savedPosts.userId],
    references: [profiles.id],
  }),
  post: one(posts, {
    fields: [savedPosts.postId],
    references: [posts.id],
  }),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  post: one(posts, {
    fields: [reactions.postId],
    references: [posts.id],
  }),
  user: one(profiles, {
    fields: [reactions.userId],
    references: [profiles.id],
  }),
}));

export const commentReactionsRelations = relations(commentReactions, ({ one }) => ({
  comment: one(comments, {
    fields: [commentReactions.commentId],
    references: [comments.id],
  }),
  user: one(profiles, {
    fields: [commentReactions.userId],
    references: [profiles.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  users: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(profiles, {
    fields: [userBadges.userId],
    references: [profiles.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const catchesRelations = relations(catches, ({ one }) => ({
  user: one(profiles, {
    fields: [catches.userId],
    references: [profiles.id],
  }),
}));

// =================================================================
// TYPES
// =================================================================

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostMedia = typeof postMedia.$inferSelect;
export type NewPostMedia = typeof postMedia.$inferInsert;
export type Friendship = typeof friendships.$inferSelect;
export type NewFriendship = typeof friendships.$inferInsert;
export type Block = typeof blocks.$inferSelect;
export type NewBlock = typeof blocks.$inferInsert;
export type UserMute = typeof userMutes.$inferSelect;
export type NewUserMute = typeof userMutes.$inferInsert;
export type Like = typeof likes.$inferSelect;
export type NewLike = typeof likes.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type DirectMessage = typeof directMessages.$inferSelect;
export type NewDirectMessage = typeof directMessages.$inferInsert;
export type DirectMessageMedia = typeof directMessageMedia.$inferSelect;
export type NewDirectMessageMedia = typeof directMessageMedia.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type Hashtag = typeof hashtags.$inferSelect;
export type NewHashtag = typeof hashtags.$inferInsert;
export type PostHashtag = typeof postHashtags.$inferSelect;
export type NewPostHashtag = typeof postHashtags.$inferInsert;
export type SavedPost = typeof savedPosts.$inferSelect;
export type NewSavedPost = typeof savedPosts.$inferInsert;
export type Reaction = typeof reactions.$inferSelect;
export type NewReaction = typeof reactions.$inferInsert;
export type CommentReaction = typeof commentReactions.$inferSelect;
export type NewCommentReaction = typeof commentReactions.$inferInsert;
export type Badge = typeof badges.$inferSelect;
export type NewBadge = typeof badges.$inferInsert;
export type UserBadge = typeof userBadges.$inferSelect;
export type NewUserBadge = typeof userBadges.$inferInsert;
export type Catch = typeof catches.$inferSelect;
export type NewCatch = typeof catches.$inferInsert;

// =================================================================
// ZOD VALIDATION SCHEMAS
// =================================================================

export const insertPostSchema = createInsertSchema(posts, {
  content: z.string().min(1).max(5000),
  visibility: z.enum(['public', 'friends_only']),
});

export const updatePostSchema = insertPostSchema.pick({
  content: true,
  visibility: true,
});

export const insertPostMediaSchema = createInsertSchema(postMedia, {
  storagePath: z.string().min(1),
  type: z.enum(['image', 'video']),
});

export const insertFriendshipSchema = createInsertSchema(friendships, {
  message: z.string().max(500).optional(),
});

export const insertBlockSchema = createInsertSchema(blocks);
export const insertUserMuteSchema = createInsertSchema(userMutes);
export const insertLikeSchema = createInsertSchema(likes);

export const insertCommentSchema = createInsertSchema(comments, {
  content: z.string().min(1).max(2000),
});

export const insertConversationSchema = createInsertSchema(conversations);

export const insertDirectMessageSchema = createInsertSchema(directMessages, {
  content: z.string().min(1).max(1000),
});

export const insertDirectMessageMediaSchema = createInsertSchema(directMessageMedia, {
  storagePath: z.string().min(1),
  type: z.enum(['image', 'video']),
});

export const insertNotificationSchema = createInsertSchema(notifications, {
  message: z.string().min(1).max(500),
  type: z.enum(['like', 'comment', 'friend_request', 'friend_accept', 'system']),
});

export const insertHashtagSchema = createInsertSchema(hashtags, {
  name: z.string().min(1).max(50).toLowerCase(),
});

export const insertPostHashtagSchema = createInsertSchema(postHashtags);
export const insertSavedPostSchema = createInsertSchema(savedPosts);

export const insertReactionSchema = createInsertSchema(reactions, {
  emojiCode: z.string().min(1).max(10),
});

export const insertCommentReactionSchema = createInsertSchema(commentReactions, {
  emojiCode: z.string().min(1).max(10),
});

export const insertBadgeSchema = createInsertSchema(badges, {
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const insertUserBadgeSchema = createInsertSchema(userBadges);

export const insertCatchSchema = createInsertSchema(catches, {
  pokemonId: z.number().int().min(1),
  storagePath: z.string().min(1),
  notes: z.string().max(1000).optional(),
});

export const selectPostSchema = createSelectSchema(posts);
export const selectPostMediaSchema = createSelectSchema(postMedia);
export const selectFriendshipSchema = createSelectSchema(friendships);
export const selectBlockSchema = createSelectSchema(blocks);
export const selectUserMuteSchema = createSelectSchema(userMutes);
export const selectLikeSchema = createSelectSchema(likes);
export const selectCommentSchema = createSelectSchema(comments);
export const selectConversationSchema = createSelectSchema(conversations);
export const selectDirectMessageSchema = createSelectSchema(directMessages);
export const selectDirectMessageMediaSchema = createSelectSchema(directMessageMedia);
export const selectNotificationSchema = createSelectSchema(notifications);
export const selectHashtagSchema = createSelectSchema(hashtags);
export const selectPostHashtagSchema = createSelectSchema(postHashtags);
export const selectSavedPostSchema = createSelectSchema(savedPosts);
export const selectReactionSchema = createSelectSchema(reactions);
export const selectCommentReactionSchema = createSelectSchema(commentReactions);
export const selectBadgeSchema = createSelectSchema(badges);
export const selectUserBadgeSchema = createSelectSchema(userBadges);
export const selectCatchSchema = createSelectSchema(catches);
