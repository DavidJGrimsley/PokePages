import { Request, Response } from 'express';
import * as socialQueries from '../../db/socialQueries.js';
import { 
  insertPostSchema, 
  updatePostSchema,
  insertCommentSchema,
  insertFriendshipSchema,
  insertMessageSchema 
} from '../../db/socialSchema.js';
import { moderateContent, getModerationMessage } from '../../utils/contentModeration.js';

// ============= POSTS =============

export async function createPost(req: Request, res: Response) {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    // CONTENT MODERATION - Check before posting
    const moderationResult = await moderateContent(req.body.content, 'ai');
    
    if (!moderationResult.isAllowed) {
      const message = getModerationMessage(moderationResult);
      return res.status(400).json({ 
        success: false, 
        error: message,
        moderationFailed: true,
        flaggedCategories: moderationResult.flaggedCategories,
      });
    }

    const validated = insertPostSchema.parse({
      ...req.body,
      authorId: userId,
    });

    const post = await socialQueries.createPost(validated);
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create post' 
    });
  }
}

export async function getPost(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const post = await socialQueries.getPostById(postId);
    
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch post' 
    });
  }
}

export async function getExploreFeed(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const posts = await socialQueries.getExploreFeed(userId, limit, offset);
    res.json({ success: true, data: posts });
  } catch (error) {
    console.error('Get explore feed error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch explore feed' 
    });
  }
}

export async function getFriendsFeed(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const posts = await socialQueries.getFriendsFeed(userId, limit, offset);
    res.json({ success: true, data: posts });
  } catch (error) {
    console.error('Get friends feed error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch friends feed' 
    });
  }
}

export async function getUserPosts(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const posts = await socialQueries.getUserPosts(userId, limit, offset);
    res.json({ success: true, data: posts });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch user posts' 
    });
  }
}

export async function updatePost(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const validated = updatePostSchema.parse(req.body);
    const post = await socialQueries.updatePost(postId, userId, validated);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found or unauthorized' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update post' 
    });
  }
}

export async function deletePost(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const deleted = await socialQueries.deletePost(postId, userId);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Post not found or unauthorized' });
    }

    res.json({ success: true, data: deleted });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete post' 
    });
  }
}

// ============= FRIENDSHIPS =============

export async function sendFriendRequest(req: Request, res: Response) {
  try {
    const { requesterId, addresseeId, message } = req.body;

    if (!requesterId || !addresseeId) {
      return res.status(400).json({ success: false, error: 'Both requester and addressee IDs are required' });
    }

    if (requesterId === addresseeId) {
      return res.status(400).json({ success: false, error: 'Cannot send friend request to yourself' });
    }

    const validated = insertFriendshipSchema.parse({ requesterId, addresseeId, message });
    const friendship = await socialQueries.sendFriendRequest(validated.requesterId, validated.addresseeId, validated.message);

    res.json({ success: true, data: friendship });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send friend request' 
    });
  }
}

export async function acceptFriendRequest(req: Request, res: Response) {
  try {
    const { friendshipId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const friendship = await socialQueries.acceptFriendRequest(friendshipId, userId);

    if (!friendship) {
      return res.status(404).json({ success: false, error: 'Friend request not found or unauthorized' });
    }

    res.json({ success: true, data: friendship });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to accept friend request' 
    });
  }
}

export async function rejectFriendRequest(req: Request, res: Response) {
  try {
    const { friendshipId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const deleted = await socialQueries.rejectFriendRequest(friendshipId, userId);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Friend request not found or unauthorized' });
    }

    res.json({ success: true, data: deleted });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to reject friend request' 
    });
  }
}

export async function removeFriend(req: Request, res: Response) {
  try {
    const { friendshipId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const deleted = await socialQueries.removeFriend(friendshipId, userId);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Friendship not found or unauthorized' });
    }

    res.json({ success: true, data: deleted });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to remove friend' 
    });
  }
}

export async function blockUser(req: Request, res: Response) {
  try {
    const { blockerId, blockedId } = req.body;

    if (!blockerId || !blockedId) {
      return res.status(400).json({ success: false, error: 'Both blocker and blocked user IDs are required' });
    }

    if (blockerId === blockedId) {
      return res.status(400).json({ success: false, error: 'Cannot block yourself' });
    }

    const block = await socialQueries.blockUser(blockerId, blockedId);
    res.json({ success: true, data: block });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to block user' 
    });
  }
}

export async function unblockUser(req: Request, res: Response) {
  try {
    const { blockerId, blockedId } = req.body;

    if (!blockerId || !blockedId) {
      return res.status(400).json({ success: false, error: 'Both blocker and blocked user IDs are required' });
    }

    const unblocked = await socialQueries.unblockUser(blockerId, blockedId);

    if (!unblocked) {
      return res.status(404).json({ success: false, error: 'Block not found' });
    }

    res.json({ success: true, data: unblocked });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to unblock user' 
    });
  }
}

export async function getFriendRequests(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const requests = await socialQueries.getFriendRequests(userId);
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch friend requests' 
    });
  }
}

export async function getFriends(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const friends = await socialQueries.getFriends(userId);
    res.json({ success: true, data: friends });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch friends' 
    });
  }
}

export async function getBlockedUsers(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const blocked = await socialQueries.getBlockedUsers(userId);
    res.json({ success: true, data: blocked });
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch blocked users' 
    });
  }
}

export async function checkFriendshipStatus(req: Request, res: Response) {
  try {
    const { userId, otherUserId } = req.query;

    if (!userId || !otherUserId) {
      return res.status(400).json({ success: false, error: 'Both user IDs are required' });
    }

    const friendship = await socialQueries.checkFriendshipStatus(
      userId as string, 
      otherUserId as string
    );
    
    res.json({ success: true, data: friendship || null });
  } catch (error) {
    console.error('Check friendship status error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to check friendship status' 
    });
  }
}

// ============= LIKES =============

export async function likePost(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const like = await socialQueries.likePost(userId, postId);
    res.json({ success: true, data: like });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to like post' 
    });
  }
}

export async function unlikePost(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const deleted = await socialQueries.unlikePost(userId, postId);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Like not found' });
    }

    res.json({ success: true, data: deleted });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to unlike post' 
    });
  }
}

export async function getPostLikes(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const likes = await socialQueries.getPostLikes(postId, limit, offset);
    res.json({ success: true, data: likes });
  } catch (error) {
    console.error('Get post likes error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch post likes' 
    });
  }
}

// ============= COMMENTS =============

export async function createComment(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    // CONTENT MODERATION - Check comment before posting
    const moderationResult = await moderateContent(req.body.content, 'ai');
    
    if (!moderationResult.isAllowed) {
      const message = getModerationMessage(moderationResult);
      return res.status(400).json({ 
        success: false, 
        error: message,
        moderationFailed: true,
        flaggedCategories: moderationResult.flaggedCategories,
      });
    }

    const validated = insertCommentSchema.parse({
      ...req.body,
      postId,
      authorId: userId,
    });

    const comment = await socialQueries.createComment(validated);
    res.json({ success: true, data: comment });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create comment' 
    });
  }
}

export async function getPostComments(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const comments = await socialQueries.getPostComments(postId, limit, offset);
    res.json({ success: true, data: comments });
  } catch (error) {
    console.error('Get post comments error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch comments' 
    });
  }
}

export async function updateComment(req: Request, res: Response) {
  try {
    const { commentId } = req.params;
    const { userId, content } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    const comment = await socialQueries.updateComment(commentId, userId, content);

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found or unauthorized' });
    }

    res.json({ success: true, data: comment });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update comment' 
    });
  }
}

export async function deleteComment(req: Request, res: Response) {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const deleted = await socialQueries.deleteComment(commentId, userId);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Comment not found or unauthorized' });
    }

    res.json({ success: true, data: deleted });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete comment' 
    });
  }
}

// ============= MESSAGES =============

export async function sendMessage(req: Request, res: Response) {
  try {
    const { senderId, recipientId, content, friendshipId } = req.body;

    if (!senderId || !recipientId || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Sender ID, recipient ID, and content are required' 
      });
    }

    const validated = insertMessageSchema.parse({
      senderId,
      recipientId,
      content,
      friendshipId,
    });

    const message = await socialQueries.sendMessage(validated);
    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send message' 
    });
  }
}

export async function getConversation(req: Request, res: Response) {
  try {
    const { userId, otherUserId } = req.query;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId || !otherUserId) {
      return res.status(400).json({ success: false, error: 'Both user IDs are required' });
    }

    const conversation = await socialQueries.getConversation(
      userId as string,
      otherUserId as string,
      limit,
      offset
    );

    res.json({ success: true, data: conversation });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch conversation' 
    });
  }
}

export async function getUnreadMessagesCount(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const count = await socialQueries.getUnreadMessagesCount(userId);
    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error('Get unread messages count error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch unread messages count' 
    });
  }
}

export async function markMessageAsRead(req: Request, res: Response) {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const message = await socialQueries.markMessageAsRead(messageId, userId);

    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found or unauthorized' });
    }

    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to mark message as read' 
    });
  }
}

export async function markConversationAsRead(req: Request, res: Response) {
  try {
    const { userId, otherUserId } = req.body;

    if (!userId || !otherUserId) {
      return res.status(400).json({ success: false, error: 'Both user IDs are required' });
    }

    await socialQueries.markConversationAsRead(userId, otherUserId);
    res.json({ success: true, data: { message: 'Conversation marked as read' } });
  } catch (error) {
    console.error('Mark conversation as read error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to mark conversation as read' 
    });
  }
}

export async function getRecentConversations(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const conversations = await socialQueries.getRecentConversations(userId);
    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error('Get recent conversations error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch recent conversations' 
    });
  }
}
