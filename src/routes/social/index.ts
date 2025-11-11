import { Router } from 'express';
import * as socialController from './socialController.js';

const router = Router();

// ============= POSTS =============
router.post('/posts', socialController.createPost);
router.get('/posts/:postId', socialController.getPost);
router.get('/posts/feed/explore', socialController.getExploreFeed);
router.get('/posts/feed/friends', socialController.getFriendsFeed);
router.get('/posts/user/:userId', socialController.getUserPosts);
router.put('/posts/:postId', socialController.updatePost);
router.delete('/posts/:postId', socialController.deletePost);

// ============= FRIENDSHIPS =============
router.post('/friendships/request', socialController.sendFriendRequest);
router.post('/friendships/:friendshipId/accept', socialController.acceptFriendRequest);
router.post('/friendships/:friendshipId/reject', socialController.rejectFriendRequest);
router.post('/friendships/unfriend', socialController.unfriend);
router.post('/friendships/block', socialController.blockUser);
router.post('/friendships/unblock', socialController.unblockUser);
router.get('/friendships/requests', socialController.getFriendRequests);
router.get('/friendships/pending', socialController.getPendingFriendRequests);
router.get('/friendships/friends', socialController.getUserFriends);
router.get('/friendships/blocked', socialController.getBlockedUsers);
router.get('/friendships/status', socialController.getFriendshipStatus);

// ============= LIKES =============
router.post('/posts/:postId/like', socialController.likePost);
router.delete('/posts/:postId/like', socialController.unlikePost);
router.get('/posts/:postId/likes', socialController.getPostLikes);

// ============= COMMENTS =============
router.post('/posts/:postId/comments', socialController.createComment);
router.get('/posts/:postId/comments', socialController.getPostComments);
router.delete('/comments/:commentId', socialController.deleteComment);

// ============= COMMENT REACTIONS =============
router.post('/comments/:commentId/reactions', socialController.addCommentReaction);
router.delete('/comments/:commentId/reactions', socialController.removeCommentReaction);
router.get('/comments/:commentId/reactions', socialController.getCommentReactions);

// ============= MUTES =============
router.post('/mutes', socialController.muteUser);
router.delete('/mutes', socialController.unmuteUser);
router.get('/mutes', socialController.getMutedUsers);

// ============= NOTIFICATIONS =============
router.get('/notifications', socialController.getUserNotifications);
router.post('/notifications/:notificationId/read', socialController.markNotificationAsRead);
router.post('/notifications/read-all', socialController.markAllNotificationsAsRead);

// ============= MESSAGES & CONVERSATIONS =============
router.post('/messages', socialController.sendMessage);
router.get('/conversations/:conversationId', socialController.getConversation);
router.get('/messages/conversations', socialController.getRecentConversations);
router.get('/messages/unread-count', socialController.getUnreadMessagesCount);
router.post('/messages/:messageId/read', socialController.markMessageRead);

// ============= REACTIONS =============
router.post('/posts/:postId/reactions', socialController.addReaction);
router.delete('/posts/:postId/reactions', socialController.removeReaction);
router.get('/posts/:postId/reactions', socialController.getPostReactions);

// ============= HASHTAGS =============
router.get('/hashtags/:hashtag/posts', socialController.getPostsByHashtag);
router.get('/hashtags/search', socialController.searchHashtags);

// ============= CATCHES =============
router.get('/catches/:userId', socialController.getUserCatches);

export default router;
