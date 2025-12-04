import { Router } from 'express';
import * as socialController from './controller.js';

const router = Router();

// ============= POSTS =============
/**
 * @route POST /api/social/posts
 * @desc Create a new post
 * @access Private
 * @body { content: string, mediaUrls?: string[], visibility?: string }
 */
router.post('/posts', socialController.createPost);

/**
 * @route GET /api/social/posts/:postId
 * @desc Get a specific post by ID
 * @access Public
 */
router.get('/posts/:postId', socialController.getPost);

/**
 * @route GET /api/social/posts/feed/explore
 * @desc Get explore feed (public posts from all users)
 * @access Public
 * @query { userId?: string, limit?: number, offset?: number }
 */
router.get('/posts/feed/explore', socialController.getExploreFeed);

/**
 * @route GET /api/social/posts/feed/friends
 * @desc Get friends feed (posts from friends only)
 * @access Private
 * @query { userId: string, limit?: number, offset?: number }
 */
router.get('/posts/feed/friends', socialController.getFriendsFeed);

/**
 * @route GET /api/social/posts/user/:userId
 * @desc Get all posts by a specific user
 * @access Public
 * @query { limit?: number, offset?: number }
 */
router.get('/posts/user/:userId', socialController.getUserPosts);

/**
 * @route PUT /api/social/posts/:postId
 * @desc Update a post (author only)
 * @access Private
 * @body { content?: string, mediaUrls?: string[], visibility?: string }
 */
router.put('/posts/:postId', socialController.updatePost);

/**
 * @route DELETE /api/social/posts/:postId
 * @desc Delete a post (author only)
 * @access Private
 */
router.delete('/posts/:postId', socialController.deletePost);

// ============= FRIENDSHIPS =============
/**
 * @route POST /api/social/friendships/request
 * @desc Send a friend request
 * @access Private
 * @body { requesterId: string, requestedId: string }
 */
router.post('/friendships/request', socialController.sendFriendRequest);

/**
 * @route POST /api/social/friendships/:friendshipId/accept
 * @desc Accept a friend request
 * @access Private
 */
router.post('/friendships/:friendshipId/accept', socialController.acceptFriendRequest);

/**
 * @route POST /api/social/friendships/:friendshipId/reject
 * @desc Reject a friend request
 * @access Private
 */
router.post('/friendships/:friendshipId/reject', socialController.rejectFriendRequest);

/**
 * @route POST /api/social/friendships/unfriend
 * @desc Unfriend a user
 * @access Private
 * @body { userId: string, friendId: string }
 */
router.post('/friendships/unfriend', socialController.unfriend);

/**
 * @route POST /api/social/friendships/block
 * @desc Block a user
 * @access Private
 * @body { userId: string, blockedUserId: string }
 */
router.post('/friendships/block', socialController.blockUser);

/**
 * @route POST /api/social/friendships/unblock
 * @desc Unblock a user
 * @access Private
 * @body { userId: string, blockedUserId: string }
 */
router.post('/friendships/unblock', socialController.unblockUser);

/**
 * @route GET /api/social/friendships/requests
 * @desc Get incoming friend requests
 * @access Private
 * @query { userId: string }
 */
router.get('/friendships/requests', socialController.getFriendRequests);

/**
 * @route GET /api/social/friendships/pending
 * @desc Get outgoing pending friend requests
 * @access Private
 * @query { userId: string }
 */
router.get('/friendships/pending', socialController.getPendingFriendRequests);

/**
 * @route GET /api/social/friendships/friends
 * @desc Get user's friends list
 * @access Public
 * @query { userId: string }
 */
router.get('/friendships/friends', socialController.getUserFriends);

/**
 * @route GET /api/social/friendships/blocked
 * @desc Get list of blocked users
 * @access Private
 * @query { userId: string }
 */
router.get('/friendships/blocked', socialController.getBlockedUsers);

/**
 * @route GET /api/social/friendships/status
 * @desc Get friendship status between two users
 * @access Public
 * @query { userId: string, otherUserId: string }
 */
router.get('/friendships/status', socialController.getFriendshipStatus);

// ============= LIKES =============
/**
 * @route POST /api/social/posts/:postId/like
 * @desc Like a post
 * @access Private
 * @body { userId: string }
 */
router.post('/posts/:postId/like', socialController.likePost);

/**
 * @route DELETE /api/social/posts/:postId/like
 * @desc Unlike a post
 * @access Private
 * @query { userId: string }
 */
router.delete('/posts/:postId/like', socialController.unlikePost);

/**
 * @route GET /api/social/posts/:postId/likes
 * @desc Get all likes for a post
 * @access Public
 */
router.get('/posts/:postId/likes', socialController.getPostLikes);

// ============= COMMENTS =============
/**
 * @route POST /api/social/posts/:postId/comments
 * @desc Create a comment on a post
 * @access Private
 * @body { userId: string, content: string }
 */
router.post('/posts/:postId/comments', socialController.createComment);

/**
 * @route GET /api/social/posts/:postId/comments
 * @desc Get all comments for a post
 * @access Public
 * @query { limit?: number, offset?: number }
 */
router.get('/posts/:postId/comments', socialController.getPostComments);

/**
 * @route DELETE /api/social/comments/:commentId
 * @desc Delete a comment (author only)
 * @access Private
 */
router.delete('/comments/:commentId', socialController.deleteComment);

// ============= COMMENT REACTIONS =============
/**
 * @route POST /api/social/comments/:commentId/reactions
 * @desc Add a reaction to a comment
 * @access Private
 * @body { userId: string, reactionType: string }
 */
router.post('/comments/:commentId/reactions', socialController.addCommentReaction);

/**
 * @route DELETE /api/social/comments/:commentId/reactions
 * @desc Remove a reaction from a comment
 * @access Private
 * @query { userId: string }
 */
router.delete('/comments/:commentId/reactions', socialController.removeCommentReaction);

/**
 * @route GET /api/social/comments/:commentId/reactions
 * @desc Get all reactions for a comment
 * @access Public
 */
router.get('/comments/:commentId/reactions', socialController.getCommentReactions);

// ============= MUTES =============
/**
 * @route POST /api/social/mutes
 * @desc Mute a user
 * @access Private
 * @body { userId: string, mutedUserId: string }
 */
router.post('/mutes', socialController.muteUser);

/**
 * @route DELETE /api/social/mutes
 * @desc Unmute a user
 * @access Private
 * @query { userId: string, mutedUserId: string }
 */
router.delete('/mutes', socialController.unmuteUser);

/**
 * @route GET /api/social/mutes
 * @desc Get list of muted users
 * @access Private
 * @query { userId: string }
 */
router.get('/mutes', socialController.getMutedUsers);

// ============= NOTIFICATIONS =============
/**
 * @route GET /api/social/notifications
 * @desc Get user's notifications
 * @access Private
 * @query { userId: string, limit?: number, offset?: number }
 */
router.get('/notifications', socialController.getUserNotifications);

/**
 * @route POST /api/social/notifications/:notificationId/read
 * @desc Mark a notification as read
 * @access Private
 */
router.post('/notifications/:notificationId/read', socialController.markNotificationAsRead);

/**
 * @route POST /api/social/notifications/read-all
 * @desc Mark all notifications as read
 * @access Private
 * @body { userId: string }
 */
router.post('/notifications/read-all', socialController.markAllNotificationsAsRead);

// ============= MESSAGES & CONVERSATIONS =============
/**
 * @route POST /api/social/messages
 * @desc Send a direct message
 * @access Private
 * @body { senderId: string, recipientId: string, content: string }
 */
router.post('/messages', socialController.sendMessage);

/**
 * @route GET /api/social/conversations/:conversationId
 * @desc Get messages in a conversation
 * @access Private
 * @query { limit?: number, offset?: number }
 */
router.get('/conversations/:conversationId', socialController.getConversation);

/**
 * @route GET /api/social/messages/conversations
 * @desc Get recent conversations
 * @access Private
 * @query { userId: string, limit?: number }
 */
router.get('/messages/conversations', socialController.getRecentConversations);

/**
 * @route GET /api/social/messages/unread-count
 * @desc Get count of unread messages
 * @access Private
 * @query { userId: string }
 */
router.get('/messages/unread-count', socialController.getUnreadMessagesCount);

/**
 * @route POST /api/social/messages/:messageId/read
 * @desc Mark a message as read
 * @access Private
 */
router.post('/messages/:messageId/read', socialController.markMessageRead);

// ============= REACTIONS =============
/**
 * @route POST /api/social/posts/:postId/reactions
 * @desc Add a reaction to a post
 * @access Private
 * @body { userId: string, reactionType: string }
 */
router.post('/posts/:postId/reactions', socialController.addReaction);

/**
 * @route DELETE /api/social/posts/:postId/reactions
 * @desc Remove a reaction from a post
 * @access Private
 * @query { userId: string }
 */
router.delete('/posts/:postId/reactions', socialController.removeReaction);

/**
 * @route GET /api/social/posts/:postId/reactions
 * @desc Get all reactions for a post
 * @access Public
 */
router.get('/posts/:postId/reactions', socialController.getPostReactions);

// ============= HASHTAGS =============
/**
 * @route GET /api/social/hashtags/:hashtag/posts
 * @desc Get posts containing a specific hashtag
 * @access Public
 * @query { userId?: string, limit?: number }
 */
router.get('/hashtags/:hashtag/posts', socialController.getPostsByHashtag);

/**
 * @route GET /api/social/hashtags/search
 * @desc Search hashtags
 * @access Public
 * @query { q: string, limit?: number }
 */
router.get('/hashtags/search', socialController.searchHashtags);

// ============= CATCHES =============
/**
 * @route GET /api/social/catches/:userId
 * @desc Get user's Pokémon catches
 * @access Public
 */
router.get('/catches/:userId', socialController.getUserCatches);

export default router;
