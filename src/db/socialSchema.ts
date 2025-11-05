import { 
  pgTable, 
  uuid, 
  timestamp, 
  text, 
  boolean, 
  integer,
  pgEnum,
  index
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { profiles } from "./profilesSchema.js";

// Enums
export const friendshipStatusEnum = pgEnum('friendship_status', [
  'pending',
  'accepted',
  'blocked'
]);

export const postVisibilityEnum = pgEnum('post_visibility', [
  'public',      // Shows in explore and friends feed
  'friends_only' // Only shows in friends feed
]);

// Posts table
export const posts = pgTable("posts", {
  id: uuid().primaryKey().defaultRandom(),
  authorId: uuid("author_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  content: text().notNull(),
  // Media support: up to 5 images OR one video
  imageUrls: text("image_urls").array(), // Array of image URLs (max 5)
  videoUrl: text("video_url"), // Single video URL
  videoDuration: integer("video_duration"), // Duration in seconds (max 30)
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

// Friendships table (handles friend requests, friends, and blocks)
export const friendships = pgTable("friendships", {
  id: uuid().primaryKey().defaultRandom(),
  requesterId: uuid("requester_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  addresseeId: uuid("addressee_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  status: friendshipStatusEnum().notNull().default('pending'),
  message: text(), // Optional message with friend request
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("friendships_requester_idx").on(table.requesterId),
  index("friendships_addressee_idx").on(table.addresseeId),
  index("friendships_status_idx").on(table.status),
]);

// Likes table
export const likes = pgTable("likes", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("likes_user_idx").on(table.userId),
  index("likes_post_idx").on(table.postId),
]);

// Comments table
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

// Messages table (only for friend requests)
export const messages = pgTable("messages", {
  id: uuid().primaryKey().defaultRandom(),
  senderId: uuid("sender_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  recipientId: uuid("recipient_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  content: text().notNull(),
  // Media support: up to 5 images OR one video
  imageUrls: text("image_urls").array(), // Array of image URLs (max 5)
  videoUrl: text("video_url"), // Single video URL
  videoDuration: integer("video_duration"), // Duration in seconds (max 30)
  isRead: boolean("is_read").notNull().default(false),
  friendshipId: uuid("friendship_id").references(() => friendships.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("messages_sender_idx").on(table.senderId),
  index("messages_recipient_idx").on(table.recipientId),
  index("messages_friendship_idx").on(table.friendshipId),
]);

// Relations
export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(profiles, {
    fields: [posts.authorId],
    references: [profiles.id],
  }),
  likes: many(likes),
  comments: many(comments),
}));

export const friendshipsRelations = relations(friendships, ({ one, many }) => ({
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
  messages: many(messages),
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

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(profiles, {
    fields: [comments.authorId],
    references: [profiles.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(profiles, {
    fields: [messages.senderId],
    references: [profiles.id],
    relationName: 'sender',
  }),
  recipient: one(profiles, {
    fields: [messages.recipientId],
    references: [profiles.id],
    relationName: 'recipient',
  }),
  friendship: one(friendships, {
    fields: [messages.friendshipId],
    references: [friendships.id],
  }),
}));

// Types
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Friendship = typeof friendships.$inferSelect;
export type NewFriendship = typeof friendships.$inferInsert;
export type Like = typeof likes.$inferSelect;
export type NewLike = typeof likes.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

// Zod Schemas
export const insertPostSchema = createInsertSchema(posts, {
  content: z.string().min(1).max(5000),
  imageUrls: z.array(z.string().url()).max(5).optional(), // Max 5 images
  videoUrl: z.string().url().optional(),
  videoDuration: z.number().int().min(1).max(30).optional(), // Max 30 seconds
  visibility: z.enum(['public', 'friends_only']),
}).refine(
  (data) => {
    // Ensure either images OR video, not both
    const hasImages = data.imageUrls && data.imageUrls.length > 0;
    const hasVideo = data.videoUrl !== null && data.videoUrl !== undefined;
    return !(hasImages && hasVideo);
  },
  {
    message: "Posts can have up to 5 images OR one video, not both",
  }
);

export const updatePostSchema = insertPostSchema.pick({
  content: true,
  imageUrls: true,
  videoUrl: true,
  videoDuration: true,
  visibility: true,
});

export const insertFriendshipSchema = createInsertSchema(friendships, {
  message: z.string().max(500).optional(),
});

export const insertLikeSchema = createInsertSchema(likes);

export const insertCommentSchema = createInsertSchema(comments, {
  content: z.string().min(1).max(2000),
});

export const insertMessageSchema = createInsertSchema(messages, {
  content: z.string().min(1).max(1000),
  imageUrls: z.array(z.string().url()).max(5).optional(), // Max 5 images
  videoUrl: z.string().url().optional(),
  videoDuration: z.number().int().min(1).max(30).optional(), // Max 30 seconds
}).refine(
  (data) => {
    // Ensure either images OR video, not both
    const hasImages = data.imageUrls && data.imageUrls.length > 0;
    const hasVideo = data.videoUrl !== null && data.videoUrl !== undefined;
    return !(hasImages && hasVideo);
  },
  {
    message: "Messages can have up to 5 images OR one video, not both",
  }
);

export const selectPostSchema = createSelectSchema(posts);
export const selectFriendshipSchema = createSelectSchema(friendships);
export const selectLikeSchema = createSelectSchema(likes);
export const selectCommentSchema = createSelectSchema(comments);
export const selectMessageSchema = createSelectSchema(messages);
