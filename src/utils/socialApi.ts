// Social API client for PokePages
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export interface Post {
  id: string;
  authorId: string;
  content: string;
  imageUrl?: string | null;
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

export async function createPost(
  userId: string,
  content: string,
  visibility: 'public' | 'friends_only' = 'public',
  imageUrl?: string
) {
  const response = await fetch(`${API_BASE_URL}/social/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, content, visibility, imageUrl }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Post;
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

export async function removeFriend(friendshipId: string, userId: string) {
  const response = await fetch(`${API_BASE_URL}/social/friendships/${friendshipId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Friendship;
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

export async function getPostComments(postId: string, limit = 50, offset = 0) {
  const response = await fetch(
    `${API_BASE_URL}/social/posts/${postId}/comments?limit=${limit}&offset=${offset}`
  );
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
  friendshipId?: string
) {
  const response = await fetch(`${API_BASE_URL}/social/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senderId, recipientId, content, friendshipId }),
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Message;
}

export async function getConversation(
  userId: string,
  otherUserId: string,
  limit = 50,
  offset = 0
) {
  const response = await fetch(
    `${API_BASE_URL}/social/messages/conversation?userId=${userId}&otherUserId=${otherUserId}&limit=${limit}&offset=${offset}`
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
  return data.data as Conversation[];
}
