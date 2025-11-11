import { eq, and, or, desc, sql, inArray, count, asc } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
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

// Profile aliases for joins
const senderProfile = alias(profiles, 'senderProfile');
const recipientProfile = alias(profiles, 'recipientProfile');

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

export async function addPostHashtags(postId: string, hashtagNames: string[]) {
  if (hashtagNames.length === 0) return [];
  
  // Normalize hashtags (lowercase, no #)
  const normalized = hashtagNames.map(tag => tag.toLowerCase().replace(/^#/, '').trim());
  
  // Get or create hashtags
  const hashtagIds: string[] = [];
  for (const name of normalized) {
    // Try to find existing hashtag
    const [existing] = await db
      .select()
      .from(hashtags)
      .where(eq(hashtags.name, name))
      .limit(1);
    
    if (existing) {
      hashtagIds.push(existing.id);
    } else {
      // Create new hashtag
      const [newHashtag] = await db
        .insert(hashtags)
        .values({ name })
        .returning();
      hashtagIds.push(newHashtag.id);
    }
  }
  
  // Link hashtags to post
  const postHashtagData = hashtagIds.map(hashtagId => ({
    postId,
    hashtagId,
  }));
  
  return await db.insert(postHashtags).values(postHashtagData).returning();
}

export async function getPostsByHashtag(
  hashtag: string,
  userId: string,
  limit = 50
) {
  // Normalize hashtag
  const normalized = hashtag.toLowerCase().replace(/^#/, '').trim();
  
  // Get blocked and muted users
  const blockedUserIds = await getBlockedUserIds(userId);
  const mutedUserIds = await getMutedUserIds(userId);
  const excludedUserIds = [...new Set([...blockedUserIds, ...mutedUserIds])];
  
  // Find hashtag
  const [hashtagRecord] = await db
    .select()
    .from(hashtags)
    .where(eq(hashtags.name, normalized))
    .limit(1);
  
  if (!hashtagRecord) {
    return []; // Hashtag doesn't exist
  }
  
  // Get posts with this hashtag
  const postsWithHashtag = await db
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
    .innerJoin(postHashtags, eq(posts.id, postHashtags.postId))
    .leftJoin(profiles, eq(posts.authorId, profiles.id))
    .where(
      and(
        eq(postHashtags.hashtagId, hashtagRecord.id),
        // Exclude blocked/muted users
        excludedUserIds.length > 0
          ? sql`${posts.authorId} NOT IN (${sql.join(excludedUserIds.map(id => sql`${id}`), sql`, `)})`
          : sql`1=1`
      )
    )
    .orderBy(desc(posts.createdAt))
    .limit(limit);
  
  // Get media for all posts
  const postIds = postsWithHashtag.map(p => p.id);
  const allMedia = postIds.length > 0
    ? await db
        .select()
        .from(postMedia)
        .where(inArray(postMedia.postId, postIds))
    : [];
  
  // Get hashtags for all posts
  const allHashtags = postIds.length > 0
    ? await db
        .select({
          postId: postHashtags.postId,
          id: hashtags.id,
          name: hashtags.name,
          createdAt: hashtags.createdAt,
        })
        .from(postHashtags)
        .innerJoin(hashtags, eq(postHashtags.hashtagId, hashtags.id))
        .where(inArray(postHashtags.postId, postIds))
    : [];
  
  // Map media to posts
  const mediaByPostId = allMedia.reduce((acc, m) => {
    if (!acc[m.postId]) acc[m.postId] = [];
    acc[m.postId].push(m);
    return acc;
  }, {} as Record<string, typeof allMedia>);
  
  // Map hashtags to posts
  const hashtagsByPostId = allHashtags.reduce((acc, h) => {
    if (!acc[h.postId]) acc[h.postId] = [];
    acc[h.postId].push({ id: h.id, name: h.name, createdAt: h.createdAt });
    return acc;
  }, {} as Record<string, { id: string; name: string; createdAt: string | null }[]>);
  
  return postsWithHashtag.map(post => ({
    ...post,
    media: mediaByPostId[post.id] || [],
    hashtags: hashtagsByPostId[post.id] || [],
  }));
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

  // Get hashtags for this post
  const postHashtagsData = await db
    .select({
      id: hashtags.id,
      name: hashtags.name,
      createdAt: hashtags.createdAt,
    })
    .from(postHashtags)
    .innerJoin(hashtags, eq(postHashtags.hashtagId, hashtags.id))
    .where(eq(postHashtags.postId, postId));

  return {
    ...post,
    media,
    hashtags: postHashtagsData,
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

  // Get hashtags for all posts
  const allHashtags = postIds.length > 0
    ? await db
        .select({
          postId: postHashtags.postId,
          id: hashtags.id,
          name: hashtags.name,
          createdAt: hashtags.createdAt,
        })
        .from(postHashtags)
        .innerJoin(hashtags, eq(postHashtags.hashtagId, hashtags.id))
        .where(inArray(postHashtags.postId, postIds))
    : [];

  // Map media to posts
  const mediaByPostId = allMedia.reduce((acc, m) => {
    if (!acc[m.postId]) acc[m.postId] = [];
    acc[m.postId].push(m);
    return acc;
  }, {} as Record<string, typeof allMedia>);

  // Map hashtags to posts
  const hashtagsByPostId = allHashtags.reduce((acc, h) => {
    if (!acc[h.postId]) acc[h.postId] = [];
    acc[h.postId].push({ id: h.id, name: h.name, createdAt: h.createdAt });
    return acc;
  }, {} as Record<string, { id: string; name: string; createdAt: string | null }[]>);

  return explorePosts.map(post => ({
    ...post,
    media: mediaByPostId[post.id] || [],
    hashtags: hashtagsByPostId[post.id] || [],
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

  // Get hashtags for all posts
  const allHashtags = postIds.length > 0
    ? await db
        .select({
          postId: postHashtags.postId,
          id: hashtags.id,
          name: hashtags.name,
          createdAt: hashtags.createdAt,
        })
        .from(postHashtags)
        .innerJoin(hashtags, eq(postHashtags.hashtagId, hashtags.id))
        .where(inArray(postHashtags.postId, postIds))
    : [];

  // Map media to posts
  const mediaByPostId = allMedia.reduce((acc, m) => {
    if (!acc[m.postId]) acc[m.postId] = [];
    acc[m.postId].push(m);
    return acc;
  }, {} as Record<string, typeof allMedia>);

  // Map hashtags to posts
  const hashtagsByPostId = allHashtags.reduce((acc, h) => {
    if (!acc[h.postId]) acc[h.postId] = [];
    acc[h.postId].push({ id: h.id, name: h.name, createdAt: h.createdAt });
    return acc;
  }, {} as Record<string, { id: string; name: string; createdAt: string | null }[]>);

  return friendsPosts.map(post => ({
    ...post,
    media: mediaByPostId[post.id] || [],
    hashtags: hashtagsByPostId[post.id] || [],
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

export async function getPostComments(postId: string, userId?: string) {
  const commentsWithAuthors = await db
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

  // Get reactions for each comment
  const commentIds = commentsWithAuthors.map(c => c.id);
  
  const reactionsData = commentIds.length > 0 ? await db
    .select({
      commentId: commentReactions.commentId,
      emojiCode: commentReactions.emojiCode,
      count: count(),
    })
    .from(commentReactions)
    .where(sql`${commentReactions.commentId} IN (${sql.join(commentIds.map(id => sql`${id}`), sql`, `)})`)
    .groupBy(commentReactions.commentId, commentReactions.emojiCode) : [];

  // Get user's reactions if userId provided
  const userReactionsData = userId && commentIds.length > 0 ? await db
    .select({
      commentId: commentReactions.commentId,
      emojiCode: commentReactions.emojiCode,
    })
    .from(commentReactions)
    .where(and(
      eq(commentReactions.userId, userId),
      sql`${commentReactions.commentId} IN (${sql.join(commentIds.map(id => sql`${id}`), sql`, `)})`
    )) : [];

  // Combine data
  return commentsWithAuthors.map(comment => ({
    ...comment,
    reactions: reactionsData
      .filter(r => r.commentId === comment.id)
      .map(r => ({ emojiCode: r.emojiCode, count: r.count })),
    userReaction: userReactionsData.find(ur => ur.commentId === comment.id)?.emojiCode || null,
  }));
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

export async function getPendingFriendRequests(userId: string) {
  // Get all pending friend requests where THIS user is the REQUESTER
  // (i.e., friend requests they sent that haven't been accepted/rejected yet)
  return await db
    .select({
      id: friendships.id,
      addresseeId: friendships.addresseeId,
      requesterId: friendships.requesterId,
      message: friendships.message,
      createdAt: friendships.createdAt,
      addressee: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
      },
    })
    .from(friendships)
    .leftJoin(profiles, eq(friendships.addresseeId, profiles.id))
    .where(and(
      eq(friendships.requesterId, userId),
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

/**
 * Get the friendship record (any status) between two users, if it exists.
 * Returns null when no relationship.
 */
export async function getFriendshipStatus(userId: string, otherUserId: string) {
  if (userId === otherUserId) {
    return null; // Never a friendship with self
  }

  const [friendship] = await db
    .select({
      id: friendships.id,
      requesterId: friendships.requesterId,
      addresseeId: friendships.addresseeId,
      status: friendships.status,
      message: friendships.message,
      createdAt: friendships.createdAt,
    })
    .from(friendships)
    .where(or(
      and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, otherUserId)),
      and(eq(friendships.requesterId, otherUserId), eq(friendships.addresseeId, userId))
    ))
    .limit(1);

  return friendship || null;
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

// Temporary participant-less conversation mapping: we consider a conversation existing
// if there are any messages between two users. We reuse its conversationId.
export async function getOrCreateConversation(userId1: string, userId2: string) {
  const existing = await db
    .select({ conversationId: directMessages.conversationId })
    .from(directMessages)
    .where(or(
      and(eq(directMessages.senderId, userId1), sql`recipient_id = ${userId2}`),
      and(eq(directMessages.senderId, userId2), sql`recipient_id = ${userId1}`)
    ))
    .limit(1);

  if (existing.length > 0) {
    return { id: existing[0].conversationId } as any;
  }

  return await createConversation();
}

export async function getConversationBetweenUsers(userId1: string, userId2: string, limit = 50, offset = 0) {
  // Get all messages between two users
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
    .where(
      or(
        and(eq(directMessages.senderId, userId1), sql`recipient_id = ${userId2}`),
        and(eq(directMessages.senderId, userId2), sql`recipient_id = ${userId1}`)
      )
    )
    .orderBy(desc(directMessages.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getUserConversations(userId: string) {
  // Build conversation summaries where user is either sender or recipient
  // We need to fetch both sender and recipient profile info
  const rows = await db
    .select({
      id: directMessages.id,
      conversationId: directMessages.conversationId,
      senderId: directMessages.senderId,
      recipientId: directMessages.recipientId,
      content: directMessages.content,
      isRead: directMessages.isRead,
      createdAt: directMessages.createdAt,
      senderUsername: senderProfile.username,
      senderAvatar: senderProfile.avatarUrl,
      recipientUsername: recipientProfile.username,
      recipientAvatar: recipientProfile.avatarUrl,
    })
    .from(directMessages)
    .leftJoin(senderProfile, eq(directMessages.senderId, senderProfile.id))
    .leftJoin(recipientProfile, eq(directMessages.recipientId, recipientProfile.id))
    .where(
      or(
        eq(directMessages.senderId, userId),
        eq(directMessages.recipientId, userId)
      )
    )
    .orderBy(desc(directMessages.createdAt))
    .limit(200);

  // Reduce to latest per conversation and attach proper "otherUser" info
  const byConv = new Map<string, any>();
  for (const r of rows) {
    const key = r.conversationId as string;
    if (!byConv.has(key)) {
      byConv.set(key, r);
    }
  }

  const conversations = Array.from(byConv.values()).map((r) => {
    const otherId = r.senderId === userId ? r.recipientId : r.senderId;
    const otherUser = r.senderId === userId 
      ? { id: r.recipientId, username: r.recipientUsername, avatarUrl: r.recipientAvatar }
      : { id: r.senderId, username: r.senderUsername, avatarUrl: r.senderAvatar };
    
    return {
      conversationId: r.conversationId,
      otherUserId: otherId,
      lastMessageId: r.id,
      lastMessageContent: r.content,
      lastMessageTime: r.createdAt,
      unreadCount: 0,
      otherUser,
    };
  });

  return conversations;
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
      recipientId: directMessages.recipientId,
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

/**
 * Get total unread message count for a user across all conversations
 */
export async function getUnreadMessagesCount(userId: string): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(directMessages)
    .where(
      and(
        eq(directMessages.recipientId, userId),
        eq(directMessages.isRead, false)
      )
    );
  
  return result[0]?.count || 0;
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
  // Enforce one reaction per (user, post); toggle if same, switch if different
  return await db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(reactions)
      .where(and(eq(reactions.userId, userId), eq(reactions.postId, postId)));

    const hasTarget = existing.some((r) => r.emojiCode === emojiCode);

    // Toggle off if the same emoji already exists
    if (hasTarget) {
      await tx
        .delete(reactions)
        .where(and(
          eq(reactions.userId, userId),
          eq(reactions.postId, postId),
          eq(reactions.emojiCode, emojiCode)
        ));
      // Also clean up any stray duplicates for safety
      await tx
        .delete(reactions)
        .where(and(eq(reactions.userId, userId), eq(reactions.postId, postId), sql`${reactions.emojiCode} <> ${emojiCode}`));
      return null; // removed
    }

    // Change reaction: remove any others first to avoid unique conflicts, then insert
    if (existing.length > 0) {
      await tx
        .delete(reactions)
        .where(and(eq(reactions.userId, userId), eq(reactions.postId, postId)));
    }

    const [inserted] = await tx
      .insert(reactions)
      .values({ userId, postId, emojiCode })
      .returning();
    return inserted;
  });
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

// ============= COMMENT REACTIONS =============

export async function addCommentReaction(userId: string, commentId: string, emojiCode: string) {
  // Enforce one reaction per (user, comment); toggle if same, switch if different
  return await db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(commentReactions)
      .where(and(eq(commentReactions.userId, userId), eq(commentReactions.commentId, commentId)));

    const hasTarget = existing.some((r) => r.emojiCode === emojiCode);

    if (hasTarget) {
      // Toggle off the same emoji and clean up any duplicates
      await tx
        .delete(commentReactions)
        .where(and(
          eq(commentReactions.userId, userId),
          eq(commentReactions.commentId, commentId),
          eq(commentReactions.emojiCode, emojiCode)
        ));
      await tx
        .delete(commentReactions)
        .where(and(
          eq(commentReactions.userId, userId),
          eq(commentReactions.commentId, commentId),
          sql`${commentReactions.emojiCode} <> ${emojiCode}`
        ));
      return null; // removed
    }

    // Switch reaction: remove any other emoji(s) then insert the target
    if (existing.length > 0) {
      await tx
        .delete(commentReactions)
        .where(and(eq(commentReactions.userId, userId), eq(commentReactions.commentId, commentId)));
    }

    const [inserted] = await tx
      .insert(commentReactions)
      .values({ userId, commentId, emojiCode })
      .returning();
    return inserted;
  });
}

export async function removeCommentReaction(userId: string, commentId: string, emojiCode: string) {
  await db
    .delete(commentReactions)
    .where(and(
      eq(commentReactions.userId, userId),
      eq(commentReactions.commentId, commentId),
      eq(commentReactions.emojiCode, emojiCode)
    ));
}

export async function getCommentReactions(commentId: string) {
  return await db
    .select({
      emojiCode: commentReactions.emojiCode,
      count: count(),
    })
    .from(commentReactions)
    .where(eq(commentReactions.commentId, commentId))
    .groupBy(commentReactions.emojiCode);
}

// ============= HELPER FUNCTIONS =============

/**
 * Transform post media array into convenient imageUrls and videoUrl fields
 */
export function transformPostMedia(post: any) {
  if (!post.media || post.media.length === 0) {
    return {
      ...post,
      imageUrls: [],
      videoUrl: null,
    };
  }

  const images = post.media.filter((m: any) => m.type === 'image');
  const video = post.media.find((m: any) => m.type === 'video');

  return {
    ...post,
    imageUrls: images.map((m: any) => m.storagePath),
    videoUrl: video ? video.storagePath : null,
  };
}
