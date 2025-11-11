// Social API client for PokePages
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export interface ModerationMeta {
  mode: 'ai' | 'basic' | 'advanced';
  fallbackReason?: string;
}

export interface PostMedia {
  id: string;
  postId: string;
  storagePath: string;
  type: 'image' | 'video';
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  imageUrl?: string | null; // Legacy field - kept for backward compatibility
  visibility: 'public' | 'friends_only';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    username: string | null;
    avatarUrl: string | null;
  };
  isLikedByUser?: boolean;
  hashtags?: {
    id: string;
    name: string;
    createdAt: string | null;
  }[];
  media?: PostMedia[]; // New: array of media (images/videos)
  imageUrls?: string[]; // Convenience: URLs of images
  videoUrl?: string | null; // Convenience: URL of video (if any)
}

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'blocked';
  message?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequest {
  id: string;
  requesterId: string;
  message?: string | null;
  createdAt: string;
  requester?: {
    id: string;
    username: string | null;
    avatarUrl: string | null;
  };
}

export interface Friend {
  friendshipId: string;
  friendId: string;
  createdAt: string;
  friend?: {
    id: string;
    username: string | null;
    avatarUrl: string | null;
    bio: string | null;
  };
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    username: string | null;
    avatarUrl: string | null;
  };
  reactions?: ReactionCount[];
  userReaction?: ReactionType | null;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  friendshipId?: string | null;
  createdAt: string;
  sender?: {
    id: string;
    username: string | null;
    avatarUrl: string | null;
  };
}

export interface Conversation {
  conversationId?: string; // newly added id reference for navigation
  otherUserId: string;
  lastMessageId: string;
  lastMessageContent: string;
  lastMessageTime: string;
  unreadCount: number;
  otherUser?: {
    id: string;
    username: string | null;
    avatarUrl: string | null;
  };
}

// ============= POSTS =============

export interface CreatePostResponse {
  post: Post;
  moderation?: ModerationMeta;
}

export async function createPost(
  userId: string,
  content: string,
  visibility: 'public' | 'friends_only' = 'public',
  imageUrl?: string,
  hashtags?: string[],
  imageUrls?: string[],
  videoUrl?: string | null
): Promise<CreatePostResponse> {
  const response = await fetch(`${API_BASE_URL}/social/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      userId, 
      content, 
      visibility, 
      imageUrl, 
      hashtags,
      imageUrls,
      videoUrl 
    }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return {
    post: data.data as Post,
    moderation: data.moderation as ModerationMeta | undefined,
  };
}

export async function getPost(postId: string) {
  const response = await fetch(`${API_BASE_URL}/social/posts/${postId}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Post;
}

export async function getExploreFeed(userId: string, limit = 20, offset = 0) {
  const response = await fetch(
    `${API_BASE_URL}/social/posts/feed/explore?userId=${userId}&limit=${limit}&offset=${offset}`
  );
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Post[];
}

export async function getFriendsFeed(userId: string, limit = 20, offset = 0) {
  const response = await fetch(
    `${API_BASE_URL}/social/posts/feed/friends?userId=${userId}&limit=${limit}&offset=${offset}`
  );
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Post[];
}

export async function getPostsByHashtag(hashtag: string, userId: string, limit = 50) {
  const response = await fetch(
    `${API_BASE_URL}/social/hashtags/${encodeURIComponent(hashtag)}/posts?userId=${userId}&limit=${limit}`
  );
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Post[];
}

export async function getUserPosts(userId: string, limit = 20, offset = 0) {
  const response = await fetch(
    `${API_BASE_URL}/social/posts/user/${userId}?limit=${limit}&offset=${offset}`
  );
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Post[];
}

export async function updatePost(
  postId: string,
  userId: string,
  updates: { content?: string; visibility?: 'public' | 'friends_only'; imageUrl?: string }
) {
  const response = await fetch(`${API_BASE_URL}/social/posts/${postId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...updates }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Post;
}

export async function deletePost(postId: string, userId: string) {
  const response = await fetch(`${API_BASE_URL}/social/posts/${postId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Post;
}

// ============= FRIENDSHIPS =============

export async function sendFriendRequest(requesterId: string, addresseeId: string, message?: string) {
  const response = await fetch(`${API_BASE_URL}/social/friendships/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requesterId, addresseeId, message }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Friendship;
}

export async function acceptFriendRequest(friendshipId: string, userId: string) {
  const response = await fetch(`${API_BASE_URL}/social/friendships/${friendshipId}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Friendship;
}

export async function rejectFriendRequest(friendshipId: string, userId: string) {
  const response = await fetch(`${API_BASE_URL}/social/friendships/${friendshipId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Friendship;
}

export async function unfriend(userId: string, friendId: string) {
  const response = await fetch(`${API_BASE_URL}/social/friendships/unfriend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, friendId }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function blockUser(blockerId: string, blockedId: string) {
  const response = await fetch(`${API_BASE_URL}/social/friendships/block`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blockerId, blockedId }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Friendship;
}

export async function unblockUser(blockerId: string, blockedId: string) {
  const response = await fetch(`${API_BASE_URL}/social/friendships/unblock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blockerId, blockedId }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Friendship;
}

export async function getFriendRequests(userId: string) {
  const response = await fetch(`${API_BASE_URL}/social/friendships/requests?userId=${userId}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as FriendRequest[];
}

export async function getFriends(userId: string) {
  const response = await fetch(`${API_BASE_URL}/social/friendships/friends?userId=${userId}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Friend[];
}

export async function getBlockedUsers(userId: string) {
  const response = await fetch(`${API_BASE_URL}/social/friendships/blocked?userId=${userId}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as any[];
}

export async function checkFriendshipStatus(userId: string, otherUserId: string) {
  const response = await fetch(
    `${API_BASE_URL}/social/friendships/status?userId=${userId}&otherUserId=${otherUserId}`
  );
  const data = await response.json();
  console.log('[socialApi] friendship status response:', data);
  if (!data.success) throw new Error(data.error);
  return data.data as Friendship | null;
}

// ============= LIKES =============

export async function likePost(postId: string, userId: string) {
  const response = await fetch(`${API_BASE_URL}/social/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function unlikePost(postId: string, userId: string) {
  const response = await fetch(`${API_BASE_URL}/social/posts/${postId}/like`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function getPostLikes(postId: string, limit = 50, offset = 0) {
  const response = await fetch(
    `${API_BASE_URL}/social/posts/${postId}/likes?limit=${limit}&offset=${offset}`
  );
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

// ============= COMMENTS =============

export async function createComment(postId: string, userId: string, content: string) {
  const response = await fetch(`${API_BASE_URL}/social/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, content }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Comment;
}

export async function getPostComments(postId: string, limit = 50, offset = 0, userId?: string) {
  const url = userId 
    ? `${API_BASE_URL}/social/posts/${postId}/comments?limit=${limit}&offset=${offset}&userId=${userId}`
    : `${API_BASE_URL}/social/posts/${postId}/comments?limit=${limit}&offset=${offset}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Comment[];
}

export async function updateComment(commentId: string, userId: string, content: string) {
  const response = await fetch(`${API_BASE_URL}/social/comments/${commentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, content }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Comment;
}

export async function deleteComment(commentId: string, userId: string) {
  const response = await fetch(`${API_BASE_URL}/social/comments/${commentId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Comment;
}

// ============= MESSAGES =============

export async function sendMessage(
  senderId: string,
  recipientId: string,
  content: string,
  options: { friendshipId?: string; conversationId?: string } = {}
) {
  const response = await fetch(`${API_BASE_URL}/social/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senderId, recipientId, content, friendshipId: options.friendshipId, conversationId: options.conversationId }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Message;
}

export async function getConversation(
  conversationId: string,
  limit = 50,
  offset = 0
) {
  const response = await fetch(
    `${API_BASE_URL}/social/conversations/${conversationId}?limit=${limit}&offset=${offset}`
  );
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Message[];
}

export async function getUnreadMessagesCount(userId: string) {
  const response = await fetch(`${API_BASE_URL}/social/messages/unread-count?userId=${userId}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data.count as number;
}

export async function markMessageAsRead(messageId: string, userId: string) {
  const response = await fetch(`${API_BASE_URL}/social/messages/${messageId}/read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Message;
}

export async function markConversationAsRead(userId: string, otherUserId: string) {
  const response = await fetch(`${API_BASE_URL}/social/messages/conversation/read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, otherUserId }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function getRecentConversations(userId: string) {
  const response = await fetch(`${API_BASE_URL}/social/messages/conversations?userId=${userId}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  // Ensure each item has conversationId if backend returned it directly on the message / summary object.
  return (data.data as any[]).map((item) => ({
    conversationId: item.conversationId || item.id || item.lastMessageId,
    otherUserId: item.otherUserId || item.otherUser?.id || item.recipientId || '',
    lastMessageId: item.lastMessageId || item.id,
    lastMessageContent: item.lastMessageContent || item.content || '',
    lastMessageTime: item.lastMessageTime || item.createdAt,
    unreadCount: item.unreadCount || 0,
    otherUser: item.otherUser,
  })) as Conversation[];
}

// ============= REACTIONS =============

export type ReactionType = 'heart' | 'shiny' | 'fire' | 'meh' | 'heartbreak' | 'hundred';

export interface Reaction {
  id: string;
  userId: string;
  postId: string;
  emojiCode: ReactionType;
  createdAt: string;
}

export interface ReactionCount {
  emojiCode: ReactionType;
  count: number;
}

export async function addReaction(postId: string, userId: string, emojiCode: ReactionType) {
  const response = await fetch(`${API_BASE_URL}/social/posts/${postId}/reactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, emojiCode }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Reaction;
}

export async function removeReaction(postId: string, userId: string, emojiCode: ReactionType) {
  const response = await fetch(`${API_BASE_URL}/social/posts/${postId}/reactions`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, emojiCode }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function getPostReactions(postId: string) {
  const response = await fetch(`${API_BASE_URL}/social/posts/${postId}/reactions`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as ReactionCount[];
}

// ============= COMMENT REACTIONS =============

export async function addCommentReaction(commentId: string, userId: string, emojiCode: ReactionType) {
  const response = await fetch(`${API_BASE_URL}/social/comments/${commentId}/reactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, emojiCode }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Reaction;
}

export async function removeCommentReaction(commentId: string, userId: string, emojiCode: ReactionType) {
  const response = await fetch(`${API_BASE_URL}/social/comments/${commentId}/reactions`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, emojiCode }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function getCommentReactions(commentId: string) {
  const response = await fetch(`${API_BASE_URL}/social/comments/${commentId}/reactions`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as ReactionCount[];
}

// ============= HASHTAGS =============

export interface Hashtag {
  id: string;
  name: string;
  useCount: number;
  createdAt: string;
}

export async function searchHashtags(query: string, limit = 10) {
  const response = await fetch(
    `${API_BASE_URL}/social/hashtags/search?query=${encodeURIComponent(query)}&limit=${limit}`
  );
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Hashtag[];
}

