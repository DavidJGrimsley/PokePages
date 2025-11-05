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
router.delete('/friendships/:friendshipId', socialController.removeFriend);
router.post('/friendships/block', socialController.blockUser);
router.post('/friendships/unblock', socialController.unblockUser);
router.get('/friendships/requests', socialController.getFriendRequests);
router.get('/friendships/friends', socialController.getFriends);
router.get('/friendships/blocked', socialController.getBlockedUsers);
router.get('/friendships/status', socialController.checkFriendshipStatus);

// ============= LIKES =============
router.post('/posts/:postId/like', socialController.likePost);
router.delete('/posts/:postId/like', socialController.unlikePost);
router.get('/posts/:postId/likes', socialController.getPostLikes);

// ============= COMMENTS =============
router.post('/posts/:postId/comments', socialController.createComment);
router.get('/posts/:postId/comments', socialController.getPostComments);
router.put('/comments/:commentId', socialController.updateComment);
router.delete('/comments/:commentId', socialController.deleteComment);

// ============= MESSAGES =============
router.post('/messages', socialController.sendMessage);
router.get('/messages/conversation', socialController.getConversation);
router.get('/messages/unread-count', socialController.getUnreadMessagesCount);
router.post('/messages/:messageId/read', socialController.markMessageAsRead);
router.post('/messages/conversation/read', socialController.markConversationAsRead);
router.get('/messages/conversations', socialController.getRecentConversations);

export default router;
