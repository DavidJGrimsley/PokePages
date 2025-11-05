import { eq, and, or, desc, sql, inArray } from 'drizzle-orm';
import { db } from './index.js';
import { 
  posts, 
  friendships, 
  likes, 
  comments, 
  messages,
  type NewPost,
  type NewComment,
  type NewMessage,
} from './socialSchema.js';
import { profiles } from './profilesSchema.js';

// ============= POSTS =============

export async function createPost(data: NewPost) {
  const [post] = await db.insert(posts).values(data).returning();
  return post;
}

export async function getPostById(postId: string) {
  const [post] = await db
    .select({
      id: posts.id,
      authorId: posts.authorId,
      content: posts.content,
      imageUrl: posts.imageUrl,
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
    })
    .from(posts)
    .leftJoin(profiles, eq(posts.authorId, profiles.id))
    .where(eq(posts.id, postId))
    .limit(1);
  
  return post;
}

export async function getExploreFeed(userId: string, limit = 20, offset = 0) {
  // Get blocked users
  const blockedUsers = await getBlockedUserIds(userId);

  // Get public posts from non-blocked users
  const explorePosts = await db
    .select({
      id: posts.id,
      authorId: posts.authorId,
      content: posts.content,
      imageUrl: posts.imageUrl,
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
        blockedUsers.length > 0 ? sql`${posts.authorId} NOT IN (${sql.join(blockedUsers.map(id => sql`${id}`), sql`, `)})` : undefined
      )
    )
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  return explorePosts;
}

export async function getFriendsFeed(userId: string, limit = 20, offset = 0) {
  // Get user's friends
  const userFriends = await db
    .select({ friendId: friendships.addresseeId })
    .from(friendships)
    .where(and(
      eq(friendships.requesterId, userId),
      eq(friendships.status, 'accepted')
    ))
    .union(
      db
        .select({ friendId: friendships.requesterId })
        .from(friendships)
        .where(and(
          eq(friendships.addresseeId, userId),
          eq(friendships.status, 'accepted')
        ))
    );

  const friendIds = userFriends.map(f => f.friendId);

  if (friendIds.length === 0) {
    return [];
  }

  // Get posts from friends
  const friendsPosts = await db
    .select({
      id: posts.id,
      authorId: posts.authorId,
      content: posts.content,
      imageUrl: posts.imageUrl,
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
    .where(inArray(posts.authorId, friendIds))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  return friendsPosts;
}

export async function getUserPosts(userId: string, limit = 20, offset = 0) {
  const userPosts = await db
    .select({
      id: posts.id,
      authorId: posts.authorId,
      content: posts.content,
      imageUrl: posts.imageUrl,
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
    })
    .from(posts)
    .leftJoin(profiles, eq(posts.authorId, profiles.id))
    .where(eq(posts.authorId, userId))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  return userPosts;
}

export async function updatePost(postId: string, userId: string, data: Partial<NewPost>) {
  const [updated] = await db
    .update(posts)
    .set({ ...data, updatedAt: sql`NOW()` })
    .where(and(
      eq(posts.id, postId),
      eq(posts.authorId, userId)
    ))
    .returning();
  
  return updated;
}

export async function deletePost(postId: string, userId: string) {
  const [deleted] = await db
    .delete(posts)
    .where(and(
      eq(posts.id, postId),
      eq(posts.authorId, userId)
    ))
    .returning();
  
  return deleted;
}

// ============= FRIENDSHIPS =============

export async function sendFriendRequest(requesterId: string, addresseeId: string, message?: string) {
  // Check if friendship already exists
  const existing = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, requesterId),
          eq(friendships.addresseeId, addresseeId)
        ),
        and(
          eq(friendships.requesterId, addresseeId),
          eq(friendships.addresseeId, requesterId)
        )
      )
    )
    .limit(1);

  if (existing.length > 0) {
    throw new Error('Friendship already exists');
  }

  const [friendship] = await db
    .insert(friendships)
    .values({
      requesterId,
      addresseeId,
      message,
      status: 'pending',
    })
    .returning();

  return friendship;
}

export async function acceptFriendRequest(friendshipId: string, userId: string) {
  // Make sure the user is the addressee
  const [updated] = await db
    .update(friendships)
    .set({ 
      status: 'accepted',
      updatedAt: sql`NOW()` 
    })
    .where(and(
      eq(friendships.id, friendshipId),
      eq(friendships.addresseeId, userId)
    ))
    .returning();
  
  return updated;
}

export async function rejectFriendRequest(friendshipId: string, userId: string) {
  const [deleted] = await db
    .delete(friendships)
    .where(and(
      eq(friendships.id, friendshipId),
      eq(friendships.addresseeId, userId)
    ))
    .returning();
  
  return deleted;
}

export async function removeFriend(friendshipId: string, userId: string) {
  // User can remove a friendship if they're either the requester or addressee
  const [deleted] = await db
    .delete(friendships)
    .where(and(
      eq(friendships.id, friendshipId),
      or(
        eq(friendships.requesterId, userId),
        eq(friendships.addresseeId, userId)
      )
    ))
    .returning();
  
  return deleted;
}

export async function blockUser(blockerId: string, blockedId: string) {
  // Remove any existing friendship
  await db
    .delete(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, blockerId),
          eq(friendships.addresseeId, blockedId)
        ),
        and(
          eq(friendships.requesterId, blockedId),
          eq(friendships.addresseeId, blockerId)
        )
      )
    );

  // Create block
  const [block] = await db
    .insert(friendships)
    .values({
      requesterId: blockerId,
      addresseeId: blockedId,
      status: 'blocked',
    })
    .returning();

  return block;
}

export async function unblockUser(blockerId: string, blockedId: string) {
  const [unblocked] = await db
    .delete(friendships)
    .where(and(
      eq(friendships.requesterId, blockerId),
      eq(friendships.addresseeId, blockedId),
      eq(friendships.status, 'blocked')
    ))
    .returning();
  
  return unblocked;
}

export async function getFriendRequests(userId: string) {
  const requests = await db
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

  return requests;
}

export async function getFriends(userId: string) {
  // Get friendships where user is requester
  const asRequester = await db
    .select({
      friendshipId: friendships.id,
      friendId: friendships.addresseeId,
      createdAt: friendships.createdAt,
      friend: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
        bio: profiles.bio,
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
      friendshipId: friendships.id,
      friendId: friendships.requesterId,
      createdAt: friendships.createdAt,
      friend: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
        bio: profiles.bio,
      },
    })
    .from(friendships)
    .leftJoin(profiles, eq(friendships.requesterId, profiles.id))
    .where(and(
      eq(friendships.addresseeId, userId),
      eq(friendships.status, 'accepted')
    ));

  return [...asRequester, ...asAddressee];
}

export async function getBlockedUsers(userId: string) {
  const blocked = await db
    .select({
      id: friendships.id,
      blockedId: friendships.addresseeId,
      createdAt: friendships.createdAt,
      blockedUser: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
      },
    })
    .from(friendships)
    .leftJoin(profiles, eq(friendships.addresseeId, profiles.id))
    .where(and(
      eq(friendships.requesterId, userId),
      eq(friendships.status, 'blocked')
    ));

  return blocked;
}

async function getBlockedUserIds(userId: string) {
  const blocked = await db
    .select({ blockedId: friendships.addresseeId })
    .from(friendships)
    .where(and(
      eq(friendships.requesterId, userId),
      eq(friendships.status, 'blocked')
    ));

  return blocked.map(b => b.blockedId);
}

export async function checkFriendshipStatus(userId: string, otherUserId: string) {
  const [friendship] = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, userId),
          eq(friendships.addresseeId, otherUserId)
        ),
        and(
          eq(friendships.requesterId, otherUserId),
          eq(friendships.addresseeId, userId)
        )
      )
    )
    .limit(1);

  return friendship;
}

// ============= LIKES =============

export async function likePost(userId: string, postId: string) {
  // Check if already liked
  const [existing] = await db
    .select()
    .from(likes)
    .where(and(
      eq(likes.userId, userId),
      eq(likes.postId, postId)
    ))
    .limit(1);

  if (existing) {
    throw new Error('Post already liked');
  }

  const [like] = await db.insert(likes).values({ userId, postId }).returning();
  
  // Increment likes count
  await db
    .update(posts)
    .set({ likesCount: sql`${posts.likesCount} + 1` })
    .where(eq(posts.id, postId));

  return like;
}

export async function unlikePost(userId: string, postId: string) {
  const [deleted] = await db
    .delete(likes)
    .where(and(
      eq(likes.userId, userId),
      eq(likes.postId, postId)
    ))
    .returning();

  if (deleted) {
    // Decrement likes count
    await db
      .update(posts)
      .set({ likesCount: sql`${posts.likesCount} - 1` })
      .where(eq(posts.id, postId));
  }

  return deleted;
}

export async function getPostLikes(postId: string, limit = 50, offset = 0) {
  const postLikes = await db
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
    .orderBy(desc(likes.createdAt))
    .limit(limit)
    .offset(offset);

  return postLikes;
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

export async function getPostComments(postId: string, limit = 50, offset = 0) {
  const postComments = await db
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
    .orderBy(desc(comments.createdAt))
    .limit(limit)
    .offset(offset);

  return postComments;
}

export async function updateComment(commentId: string, userId: string, content: string) {
  const [updated] = await db
    .update(comments)
    .set({ 
      content, 
      updatedAt: sql`NOW()` 
    })
    .where(and(
      eq(comments.id, commentId),
      eq(comments.authorId, userId)
    ))
    .returning();
  
  return updated;
}

export async function deleteComment(commentId: string, userId: string) {
  const [deleted] = await db
    .delete(comments)
    .where(and(
      eq(comments.id, commentId),
      eq(comments.authorId, userId)
    ))
    .returning();

  if (deleted) {
    // Decrement comments count
    await db
      .update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} - 1` })
      .where(eq(posts.id, deleted.postId));
  }

  return deleted;
}

// ============= MESSAGES =============

export async function sendMessage(data: NewMessage) {
  const [message] = await db.insert(messages).values(data).returning();
  return message;
}

export async function getConversation(userId: string, otherUserId: string, limit = 50, offset = 0) {
  const conversation = await db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      recipientId: messages.recipientId,
      content: messages.content,
      isRead: messages.isRead,
      friendshipId: messages.friendshipId,
      createdAt: messages.createdAt,
      sender: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
      },
    })
    .from(messages)
    .leftJoin(profiles, eq(messages.senderId, profiles.id))
    .where(
      or(
        and(
          eq(messages.senderId, userId),
          eq(messages.recipientId, otherUserId)
        ),
        and(
          eq(messages.senderId, otherUserId),
          eq(messages.recipientId, userId)
        )
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(limit)
    .offset(offset);

  return conversation;
}

export async function getUnreadMessagesCount(userId: string) {
  const [result] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(messages)
    .where(and(
      eq(messages.recipientId, userId),
      eq(messages.isRead, false)
    ));

  return result?.count || 0;
}

export async function markMessageAsRead(messageId: string, userId: string) {
  const [updated] = await db
    .update(messages)
    .set({ isRead: true })
    .where(and(
      eq(messages.id, messageId),
      eq(messages.recipientId, userId)
    ))
    .returning();

  return updated;
}

export async function markConversationAsRead(userId: string, otherUserId: string) {
  await db
    .update(messages)
    .set({ isRead: true })
    .where(and(
      eq(messages.recipientId, userId),
      eq(messages.senderId, otherUserId),
      eq(messages.isRead, false)
    ));
}

export async function getRecentConversations(userId: string) {
  // Get unique conversations with the most recent message
  const conversations = await db
    .select({
      otherUserId: sql<string>`CASE 
        WHEN ${messages.senderId} = ${userId} THEN ${messages.recipientId}
        ELSE ${messages.senderId}
      END`,
      lastMessageId: sql<string>`MAX(${messages.id})`,
      lastMessageContent: sql<string>`(
        SELECT ${messages.content} 
        FROM ${messages} m2 
        WHERE (
          (m2.${messages.senderId} = ${userId} AND m2.${messages.recipientId} = CASE WHEN ${messages.senderId} = ${userId} THEN ${messages.recipientId} ELSE ${messages.senderId} END)
          OR
          (m2.${messages.recipientId} = ${userId} AND m2.${messages.senderId} = CASE WHEN ${messages.senderId} = ${userId} THEN ${messages.recipientId} ELSE ${messages.senderId} END)
        )
        ORDER BY m2.${messages.createdAt} DESC
        LIMIT 1
      )`,
      lastMessageTime: sql<string>`MAX(${messages.createdAt})`,
      unreadCount: sql<number>`COUNT(CASE WHEN ${messages.recipientId} = ${userId} AND ${messages.isRead} = false THEN 1 END)::int`,
    })
    .from(messages)
    .where(
      or(
        eq(messages.senderId, userId),
        eq(messages.recipientId, userId)
      )
    )
    .groupBy(sql`CASE 
      WHEN ${messages.senderId} = ${userId} THEN ${messages.recipientId}
      ELSE ${messages.senderId}
    END`)
    .orderBy(sql`MAX(${messages.createdAt}) DESC`);

  // Get profile info for each conversation
  const conversationsWithProfiles = await Promise.all(
    conversations.map(async (conv) => {
      const [profile] = await db
        .select({
          id: profiles.id,
          username: profiles.username,
          avatarUrl: profiles.avatarUrl,
        })
        .from(profiles)
        .where(eq(profiles.id, conv.otherUserId))
        .limit(1);

      return {
        ...conv,
        otherUser: profile,
      };
    })
  );

  return conversationsWithProfiles;
}
