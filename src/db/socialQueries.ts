import { eq, and, or, desc, sql, inArray, count, asc } from 'drizzle-orm';
import { db } from './index.js';
import { 
  posts,
  postMedia,
  friendships, 
  likes, 
  comments,
  directMessages,
  conversations,
  blocks,
  userMutes,
  notifications,
  hashtags,
  postHashtags,
  savedPosts,
  reactions,
  commentReactions,
  catches,
  type NewPost,
  type NewPostMedia,
  type NewComment,
  type NewDirectMessage,
  type NewFriendship,
  type NewLike,
  type NewBlock,
  type NewUserMute,
  type NewNotification,
  type NewConversation,
  type NewHashtag,
  type NewPostHashtag,
  type NewSavedPost,
  type NewReaction,
  type NewCommentReaction,
  type NewCatch,
} from './socialSchema.js';
import { profiles } from './profilesSchema.js';

// ============= HELPER FUNCTIONS =============

/**
 * Get IDs of users who have blocked the given user
 */
export async function getBlockedUserIds(userId: string): Promise<string[]> {
  const blocked = await db
    .select({ id: blocks.blockedId })
    .from(blocks)
    .where(eq(blocks.blockerId, userId));
  
  return blocked.map(b => b.id);
}

/**
 * Get IDs of users who have muted the given user
 */
export async function getMutedUserIds(userId: string): Promise<string[]> {
  const muted = await db
    .select({ id: userMutes.mutedUserId })
    .from(userMutes)
    .where(eq(userMutes.userId, userId));
  
  return muted.map(m => m.id);
}

/**
 * Check if user1 has blocked user2
 */
export async function hasBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  const [block] = await db
    .select()
    .from(blocks)
    .where(and(
      eq(blocks.blockerId, blockerId),
      eq(blocks.blockedId, blockedId)
    ))
    .limit(1);
  
  return !!block;
}

/**
 * Check if two users are friends
 */
export async function areFriends(userId1: string, userId2: string): Promise<boolean> {
  const [friendship] = await db
    .select()
    .from(friendships)
    .where(
      and(
        or(
          and(eq(friendships.requesterId, userId1), eq(friendships.addresseeId, userId2)),
          and(eq(friendships.requesterId, userId2), eq(friendships.addresseeId, userId1))
        ),
        eq(friendships.status, 'accepted')
      )
    )
    .limit(1);
  
  return !!friendship;
}

/**
 * Get list of user's friend IDs
 */
export async function getFriendIds(userId: string): Promise<string[]> {
  const friendsAsRequester = await db
    .select({ friendId: friendships.addresseeId })
    .from(friendships)
    .where(and(
      eq(friendships.requesterId, userId),
      eq(friendships.status, 'accepted')
    ));
  
  const friendsAsAddressee = await db
    .select({ friendId: friendships.requesterId })
    .from(friendships)
    .where(and(
      eq(friendships.addresseeId, userId),
      eq(friendships.status, 'accepted')
    ));
  
  return [
    ...friendsAsRequester.map(f => f.friendId),
    ...friendsAsAddressee.map(f => f.friendId),
  ];
}

// ============= POSTS =============

export async function createPost(data: NewPost) {
  const [post] = await db.insert(posts).values(data).returning();
  return post;
}

export async function addPostMedia(postId: string, mediaData: Omit<NewPostMedia, 'postId'>[]) {
  if (mediaData.length === 0) return [];
  
  const mediaToInsert = mediaData.map(m => ({
    ...m,
    postId,
  }));
  
  return await db.insert(postMedia).values(mediaToInsert).returning();
}

export async function getPostById(postId: string, currentUserId?: string) {
  const [post] = await db
    .select({
      id: posts.id,
      authorId: posts.authorId,
      content: posts.content,
      visibility: posts.visibility,
      likesCount: posts.likesCount,
      commentsCount: posts.commentsCount,
      sharesCount: posts.sharesCount,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      author: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
      },
      isLikedByUser: currentUserId ? sql<boolean>`EXISTS(
        SELECT 1 FROM ${likes} 
        WHERE ${likes.postId} = ${posts.id} 
        AND ${likes.userId} = ${currentUserId}
      )` : sql<boolean>`false`,
    })
    .from(posts)
    .leftJoin(profiles, eq(posts.authorId, profiles.id))
    .where(eq(posts.id, postId))
    .limit(1);
  
  if (!post) return null;

  // Get media for this post
  const media = await db
    .select()
    .from(postMedia)
    .where(eq(postMedia.postId, postId));

  return {
    ...post,
    media,
  };
}

export async function getPostMedia(postId: string) {
  return await db
    .select()
    .from(postMedia)
    .where(eq(postMedia.postId, postId))
    .orderBy(asc(postMedia.createdAt));
}

export async function getExploreFeed(userId: string, limit = 20, offset = 0) {
  // Get blocked users
  const blockedUserIds = await getBlockedUserIds(userId);
  const mutedUserIds = await getMutedUserIds(userId);
  const excludedUserIds = [...new Set([...blockedUserIds, ...mutedUserIds])];

  // Get public posts from non-blocked/non-muted users
  const explorePosts = await db
    .select({
      id: posts.id,
      authorId: posts.authorId,
      content: posts.content,
      visibility: posts.visibility,
      likesCount: posts.likesCount,
      commentsCount: posts.commentsCount,
      sharesCount: posts.sharesCount,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      author: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
      },
      isLikedByUser: sql<boolean>`EXISTS(
        SELECT 1 FROM ${likes} 
        WHERE ${likes.postId} = ${posts.id} 
        AND ${likes.userId} = ${userId}
      )`,
    })
    .from(posts)
    .leftJoin(profiles, eq(posts.authorId, profiles.id))
    .where(
      and(
        eq(posts.visibility, 'public'),
        excludedUserIds.length > 0 
          ? sql`${posts.authorId} NOT IN (${sql.join(excludedUserIds.map(id => sql`${id}`), sql`, `)})`
          : undefined
      )
    )
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  // Get media for all posts
  const postIds = explorePosts.map(p => p.id);
  const allMedia = postIds.length > 0
    ? await db
        .select()
        .from(postMedia)
        .where(inArray(postMedia.postId, postIds))
    : [];

  // Map media to posts
  const mediaByPostId = allMedia.reduce((acc, m) => {
    if (!acc[m.postId]) acc[m.postId] = [];
    acc[m.postId].push(m);
    return acc;
  }, {} as Record<string, typeof allMedia>);

  return explorePosts.map(post => ({
    ...post,
    media: mediaByPostId[post.id] || [],
  }));
}

export async function getFriendsFeed(userId: string, limit = 20, offset = 0) {
  // Get user's friend IDs
  const friendIds = await getFriendIds(userId);
  
  if (friendIds.length === 0) {
    return [];
  }

  // Get posts from friends (public + friends_only)
  const friendsPosts = await db
    .select({
      id: posts.id,
      authorId: posts.authorId,
      content: posts.content,
      visibility: posts.visibility,
      likesCount: posts.likesCount,
      commentsCount: posts.commentsCount,
      sharesCount: posts.sharesCount,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      author: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
      },
      isLikedByUser: sql<boolean>`EXISTS(
        SELECT 1 FROM ${likes} 
        WHERE ${likes.postId} = ${posts.id} 
        AND ${likes.userId} = ${userId}
      )`,
    })
    .from(posts)
    .leftJoin(profiles, eq(posts.authorId, profiles.id))
    .where(
      inArray(posts.authorId, friendIds)
    )
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  // Get media for all posts
  const postIds = friendsPosts.map(p => p.id);
  const allMedia = postIds.length > 0
    ? await db
        .select()
        .from(postMedia)
        .where(inArray(postMedia.postId, postIds))
    : [];

  // Map media to posts
  const mediaByPostId = allMedia.reduce((acc, m) => {
    if (!acc[m.postId]) acc[m.postId] = [];
    acc[m.postId].push(m);
    return acc;
  }, {} as Record<string, typeof allMedia>);

  return friendsPosts.map(post => ({
    ...post,
    media: mediaByPostId[post.id] || [],
  }));
}

export async function getUserPosts(userId: string, currentUserId: string, limit = 20, offset = 0) {
  // Check if blocked
  if (currentUserId !== userId) {
    const blocked = await hasBlocked(userId, currentUserId);
    if (blocked) {
      throw new Error('Cannot view posts from this user');
    }
  }

  // Check if friends (determines if we can see friends_only posts)
  const isFriend = currentUserId === userId || await areFriends(currentUserId, userId);

  const userPosts = await db
    .select({
      id: posts.id,
      authorId: posts.authorId,
      content: posts.content,
      visibility: posts.visibility,
      likesCount: posts.likesCount,
      commentsCount: posts.commentsCount,
      sharesCount: posts.sharesCount,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      author: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
      },
      isLikedByUser: sql<boolean>`EXISTS(
        SELECT 1 FROM ${likes} 
        WHERE ${likes.postId} = ${posts.id} 
        AND ${likes.userId} = ${currentUserId}
      )`,
    })
    .from(posts)
    .leftJoin(profiles, eq(posts.authorId, profiles.id))
    .where(
      and(
        eq(posts.authorId, userId),
        isFriend 
          ? undefined 
          : eq(posts.visibility, 'public')
      )
    )
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  // Get media for all posts
  const postIds = userPosts.map(p => p.id);
  const allMedia = postIds.length > 0
    ? await db
        .select()
        .from(postMedia)
        .where(inArray(postMedia.postId, postIds))
    : [];

  // Map media to posts
  const mediaByPostId = allMedia.reduce((acc, m) => {
    if (!acc[m.postId]) acc[m.postId] = [];
    acc[m.postId].push(m);
    return acc;
  }, {} as Record<string, typeof allMedia>);

  return userPosts.map(post => ({
    ...post,
    media: mediaByPostId[post.id] || [],
  }));
}

export async function updatePost(postId: string, authorId: string, data: Partial<NewPost>) {
  const [updated] = await db
    .update(posts)
    .set({ ...data, updatedAt: sql`NOW()` })
    .where(and(
      eq(posts.id, postId),
      eq(posts.authorId, authorId)
    ))
    .returning();
  
  return updated;
}

export async function deletePost(postId: string, authorId: string) {
  await db
    .delete(posts)
    .where(and(
      eq(posts.id, postId),
      eq(posts.authorId, authorId)
    ));
}

// ============= LIKES =============

export async function likePost(userId: string, postId: string) {
  const [like] = await db.insert(likes).values({ userId, postId }).returning();
  
  // Increment likes count
  await db
    .update(posts)
    .set({ likesCount: sql`${posts.likesCount} + 1` })
    .where(eq(posts.id, postId));
  
  return like;
}

export async function unlikePost(userId: string, postId: string) {
  await db
    .delete(likes)
    .where(and(
      eq(likes.userId, userId),
      eq(likes.postId, postId)
    ));
  
  // Decrement likes count
  await db
    .update(posts)
    .set({ likesCount: sql`GREATEST(${posts.likesCount} - 1, 0)` })
    .where(eq(posts.id, postId));
}

export async function getPostLikes(postId: string) {
  return await db
    .select({
      id: likes.id,
      userId: likes.userId,
      createdAt: likes.createdAt,
      user: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
      },
    })
    .from(likes)
    .leftJoin(profiles, eq(likes.userId, profiles.id))
    .where(eq(likes.postId, postId))
    .orderBy(desc(likes.createdAt));
}

// ============= COMMENTS =============

export async function createComment(data: NewComment) {
  const [comment] = await db.insert(comments).values(data).returning();
  
  // Increment comments count
  await db
    .update(posts)
    .set({ commentsCount: sql`${posts.commentsCount} + 1` })
    .where(eq(posts.id, data.postId));
  
  return comment;
}

export async function getPostComments(postId: string) {
  return await db
    .select({
      id: comments.id,
      postId: comments.postId,
      authorId: comments.authorId,
      content: comments.content,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      author: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
      },
    })
    .from(comments)
    .leftJoin(profiles, eq(comments.authorId, profiles.id))
    .where(eq(comments.postId, postId))
    .orderBy(asc(comments.createdAt));
}

export async function deleteComment(commentId: string, authorId: string) {
  const [deleted] = await db
    .delete(comments)
    .where(and(
      eq(comments.id, commentId),
      eq(comments.authorId, authorId)
    ))
    .returning();
  
  if (deleted) {
    // Decrement comments count
    await db
      .update(posts)
      .set({ commentsCount: sql`GREATEST(${posts.commentsCount} - 1, 0)` })
      .where(eq(posts.id, deleted.postId));
  }
  
  return deleted;
}

// ============= FRIENDSHIPS =============

export async function sendFriendRequest(requesterId: string, addresseeId: string, message?: string) {
  // Check if already friends or request exists
  const [existing] = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, requesterId), eq(friendships.addresseeId, addresseeId)),
        and(eq(friendships.requesterId, addresseeId), eq(friendships.addresseeId, requesterId))
      )
    )
    .limit(1);
  
  if (existing) {
    throw new Error('Friendship already exists or request pending');
  }

  const [friendship] = await db
    .insert(friendships)
    .values({
      requesterId,
      addresseeId,
      status: 'pending',
      message,
    })
    .returning();
  
  return friendship;
}

export async function acceptFriendRequest(friendshipId: string, addresseeId: string) {
  const [friendship] = await db
    .update(friendships)
    .set({ 
      status: 'accepted',
      updatedAt: sql`NOW()`
    })
    .where(and(
      eq(friendships.id, friendshipId),
      eq(friendships.addresseeId, addresseeId),
      eq(friendships.status, 'pending')
    ))
    .returning();
  
  return friendship;
}

export async function rejectFriendRequest(friendshipId: string, addresseeId: string) {
  await db
    .delete(friendships)
    .where(and(
      eq(friendships.id, friendshipId),
      eq(friendships.addresseeId, addresseeId),
      eq(friendships.status, 'pending')
    ));
}

export async function unfriend(userId: string, friendId: string) {
  await db
    .delete(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, friendId)),
        and(eq(friendships.requesterId, friendId), eq(friendships.addresseeId, userId))
      )
    );
}

export async function getFriendRequests(userId: string) {
  return await db
    .select({
      id: friendships.id,
      requesterId: friendships.requesterId,
      message: friendships.message,
      createdAt: friendships.createdAt,
      requester: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
      },
    })
    .from(friendships)
    .leftJoin(profiles, eq(friendships.requesterId, profiles.id))
    .where(and(
      eq(friendships.addresseeId, userId),
      eq(friendships.status, 'pending')
    ))
    .orderBy(desc(friendships.createdAt));
}

export async function getUserFriends(userId: string) {
  // Get friendships where user is requester
  const asRequester = await db
    .select({
      id: friendships.id,
      friendId: friendships.addresseeId,
      createdAt: friendships.createdAt,
      friend: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
      },
    })
    .from(friendships)
    .leftJoin(profiles, eq(friendships.addresseeId, profiles.id))
    .where(and(
      eq(friendships.requesterId, userId),
      eq(friendships.status, 'accepted')
    ));
  
  // Get friendships where user is addressee
  const asAddressee = await db
    .select({
      id: friendships.id,
      friendId: friendships.requesterId,
      createdAt: friendships.createdAt,
      friend: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
      },
    })
    .from(friendships)
    .leftJoin(profiles, eq(friendships.requesterId, profiles.id))
    .where(and(
      eq(friendships.addresseeId, userId),
      eq(friendships.status, 'accepted')
    ));
  
  return [...asRequester, ...asAddressee].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// ============= BLOCKS =============

export async function blockUser(blockerId: string, blockedId: string) {
  // Remove friendship if exists
  await unfriend(blockerId, blockedId);
  
  const [block] = await db
    .insert(blocks)
    .values({ blockerId, blockedId })
    .returning();
  
  return block;
}

export async function unblockUser(blockerId: string, blockedId: string) {
  await db
    .delete(blocks)
    .where(and(
      eq(blocks.blockerId, blockerId),
      eq(blocks.blockedId, blockedId)
    ));
}

export async function getBlockedUsers(userId: string) {
  return await db
    .select({
      id: blocks.id,
      blockedId: blocks.blockedId,
      createdAt: blocks.createdAt,
      blockedUser: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
      },
    })
    .from(blocks)
    .leftJoin(profiles, eq(blocks.blockedId, profiles.id))
    .where(eq(blocks.blockerId, userId))
    .orderBy(desc(blocks.createdAt));
}

// ============= MUTES =============

export async function muteUser(userId: string, mutedUserId: string) {
  const [mute] = await db
    .insert(userMutes)
    .values({ userId, mutedUserId })
    .returning();
  
  return mute;
}

export async function unmuteUser(userId: string, mutedUserId: string) {
  await db
    .delete(userMutes)
    .where(and(
      eq(userMutes.userId, userId),
      eq(userMutes.mutedUserId, mutedUserId)
    ));
}

export async function getMutedUsers(userId: string) {
  return await db
    .select({
      id: userMutes.id,
      mutedUserId: userMutes.mutedUserId,
      createdAt: userMutes.createdAt,
      mutedUser: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
      },
    })
    .from(userMutes)
    .leftJoin(profiles, eq(userMutes.mutedUserId, profiles.id))
    .where(eq(userMutes.userId, userId))
    .orderBy(desc(userMutes.createdAt));
}

// ============= DIRECT MESSAGES =============

export async function createConversation() {
  const [conversation] = await db
    .insert(conversations)
    .values({})
    .returning();
  
  return conversation;
}

export async function sendDirectMessage(data: NewDirectMessage) {
  const [message] = await db
    .insert(directMessages)
    .values(data)
    .returning();
  
  return message;
}

export async function getConversationMessages(conversationId: string, limit = 50, offset = 0) {
  return await db
    .select({
      id: directMessages.id,
      conversationId: directMessages.conversationId,
      senderId: directMessages.senderId,
      content: directMessages.content,
      isRead: directMessages.isRead,
      createdAt: directMessages.createdAt,
      sender: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
      },
    })
    .from(directMessages)
    .leftJoin(profiles, eq(directMessages.senderId, profiles.id))
    .where(eq(directMessages.conversationId, conversationId))
    .orderBy(desc(directMessages.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function markMessageAsRead(messageId: string) {
  await db
    .update(directMessages)
    .set({ isRead: true })
    .where(eq(directMessages.id, messageId));
}

// ============= NOTIFICATIONS =============

export async function createNotification(data: NewNotification) {
  const [notification] = await db
    .insert(notifications)
    .values(data)
    .returning();
  
  return notification;
}

export async function getUserNotifications(userId: string, limit = 20, offset = 0) {
  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(
      eq(notifications.id, notificationId),
      eq(notifications.userId, userId)
    ));
}

export async function markAllNotificationsAsRead(userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ));
}

// ============= SAVED POSTS =============

export async function savePost(userId: string, postId: string) {
  const [saved] = await db
    .insert(savedPosts)
    .values({ userId, postId })
    .returning();
  
  return saved;
}

export async function unsavePost(userId: string, postId: string) {
  await db
    .delete(savedPosts)
    .where(and(
      eq(savedPosts.userId, userId),
      eq(savedPosts.postId, postId)
    ));
}

export async function getUserSavedPosts(userId: string, limit = 20, offset = 0) {
  const saved = await db
    .select({
      id: savedPosts.id,
      postId: savedPosts.postId,
      createdAt: savedPosts.createdAt,
      post: {
        id: posts.id,
        authorId: posts.authorId,
        content: posts.content,
        visibility: posts.visibility,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        sharesCount: posts.sharesCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      },
      author: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
      },
    })
    .from(savedPosts)
    .leftJoin(posts, eq(savedPosts.postId, posts.id))
    .leftJoin(profiles, eq(posts.authorId, profiles.id))
    .where(eq(savedPosts.userId, userId))
    .orderBy(desc(savedPosts.createdAt))
    .limit(limit)
    .offset(offset);

  // Get media for all posts
  const postIds = saved.map(s => s.postId);
  const allMedia = postIds.length > 0
    ? await db
        .select()
        .from(postMedia)
        .where(inArray(postMedia.postId, postIds))
    : [];

  // Map media to posts
  const mediaByPostId = allMedia.reduce((acc, m) => {
    if (!acc[m.postId]) acc[m.postId] = [];
    acc[m.postId].push(m);
    return acc;
  }, {} as Record<string, typeof allMedia>);

  return saved.map(s => ({
    ...s,
    post: s.post ? {
      ...s.post,
      media: mediaByPostId[s.postId] || [],
    } : null,
  }));
}

// ============= CATCHES (Pokémon Gallery) =============

export async function addCatch(data: NewCatch) {
  const [catchData] = await db
    .insert(catches)
    .values(data)
    .returning();
  
  return catchData;
}

export async function getUserCatches(userId: string, limit = 20, offset = 0) {
  return await db
    .select()
    .from(catches)
    .where(eq(catches.userId, userId))
    .orderBy(desc(catches.caughtAt))
    .limit(limit)
    .offset(offset);
}

export async function deleteCatch(catchId: string, userId: string) {
  await db
    .delete(catches)
    .where(and(
      eq(catches.id, catchId),
      eq(catches.userId, userId)
    ));
}

// ============= HASHTAGS =============

export async function createHashtag(name: string) {
  const normalizedName = name.toLowerCase().replace(/^#/, '');
  
  const [hashtag] = await db
    .insert(hashtags)
    .values({ name: normalizedName })
    .onConflictDoNothing()
    .returning();
  
  // If conflict (already exists), fetch it
  if (!hashtag) {
    const [existing] = await db
      .select()
      .from(hashtags)
      .where(eq(hashtags.name, normalizedName))
      .limit(1);
    return existing;
  }
  
  return hashtag;
}

export async function linkHashtagToPost(postId: string, hashtagId: string) {
  await db
    .insert(postHashtags)
    .values({ postId, hashtagId })
    .onConflictDoNothing();
}

export async function searchHashtags(query: string, limit = 10) {
  const normalizedQuery = query.toLowerCase().replace(/^#/, '');
  
  return await db
    .select()
    .from(hashtags)
    .where(sql`${hashtags.name} LIKE ${`%${normalizedQuery}%`}`)
    .limit(limit);
}

// ============= REACTIONS =============

export async function addReaction(userId: string, postId: string, emojiCode: string) {
  const [reaction] = await db
    .insert(reactions)
    .values({ userId, postId, emojiCode })
    .returning();
  
  return reaction;
}

export async function removeReaction(userId: string, postId: string, emojiCode: string) {
  await db
    .delete(reactions)
    .where(and(
      eq(reactions.userId, userId),
      eq(reactions.postId, postId),
      eq(reactions.emojiCode, emojiCode)
    ));
}

export async function getPostReactions(postId: string) {
  return await db
    .select({
      emojiCode: reactions.emojiCode,
      count: count(),
    })
    .from(reactions)
    .where(eq(reactions.postId, postId))
    .groupBy(reactions.emojiCode);
}
