import { Request, Response } from 'express';
import * as socialQueries from '../../db/socialQueries.js';
import { 
  insertPostSchema, 
  updatePostSchema,
  insertCommentSchema,
  insertFriendshipSchema,
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
    
    // Handle media if provided (imageUrls or videoUrl)
    const mediaToAdd: { storagePath: string; type: 'image' | 'video' }[] = [];
    
    if (req.body.imageUrls && Array.isArray(req.body.imageUrls)) {
      // Validate max 5 images
      if (req.body.imageUrls.length > 5) {
        return res.status(400).json({ 
          success: false, 
          error: 'Maximum 5 images allowed per post' 
        });
      }
      
      // Add image media
      req.body.imageUrls.forEach((url: string) => {
        mediaToAdd.push({ storagePath: url, type: 'image' });
      });
    }
    
    if (req.body.videoUrl) {
      // Cannot have both images and video
      if (mediaToAdd.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Posts can contain either images OR a video, not both' 
        });
      }
      
      mediaToAdd.push({ storagePath: req.body.videoUrl, type: 'video' });
    }
    
    // Add media to database
    if (mediaToAdd.length > 0) {
      await socialQueries.addPostMedia(post.id, mediaToAdd);
    }
    
    // Handle legacy media field (for backward compatibility)
    if (req.body.media && Array.isArray(req.body.media) && req.body.media.length > 0) {
      await socialQueries.addPostMedia(post.id, req.body.media);
    }

    // Handle hashtags if provided
    if (req.body.hashtags && Array.isArray(req.body.hashtags) && req.body.hashtags.length > 0) {
      await socialQueries.addPostHashtags(post.id, req.body.hashtags);
    }

    res.json({
      success: true,
      data: post,
      moderation: {
        mode: moderationResult.mode,
        fallbackReason: moderationResult.fallbackReason,
      },
    });
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
    const currentUserId = req.query.userId as string;
    
    const post = await socialQueries.getPostById(postId, currentUserId);
    
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Transform media for convenience
    const transformedPost = socialQueries.transformPostMedia(post);

    res.json({ success: true, data: transformedPost });
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
    
    // Transform media for all posts
    const transformedPosts = posts.map(post => socialQueries.transformPostMedia(post));
    
    res.json({ success: true, data: transformedPosts });
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
    
    // Transform media for all posts
    const transformedPosts = posts.map(post => socialQueries.transformPostMedia(post));
    
    res.json({ success: true, data: transformedPosts });
  } catch (error) {
    console.error('Get friends feed error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch friends feed' 
    });
  }
}

export async function getPostsByHashtag(req: Request, res: Response) {
  try {
    const { hashtag } = req.params;
    const userId = req.query.userId as string;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    if (!hashtag) {
      return res.status(400).json({ success: false, error: 'Hashtag is required' });
    }

    const posts = await socialQueries.getPostsByHashtag(hashtag, userId, limit);
    
    // Transform media for all posts
    const transformedPosts = posts.map(post => socialQueries.transformPostMedia(post));
    
    res.json({ success: true, data: transformedPosts });
  } catch (error) {
    console.error('Get posts by hashtag error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch posts by hashtag' 
    });
  }
}

export async function getUserPosts(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const currentUserId = req.query.currentUserId as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!currentUserId) {
      return res.status(400).json({ success: false, error: 'Current user ID is required' });
    }

    const posts = await socialQueries.getUserPosts(userId, currentUserId, limit, offset);
    
    // Transform media for all posts
    const transformedPosts = posts.map(post => socialQueries.transformPostMedia(post));
    
    res.json({ success: true, data: transformedPosts });
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

    await socialQueries.deletePost(postId, userId);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete post' 
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

    await socialQueries.unlikePost(userId, postId);
    res.json({ success: true, message: 'Post unliked successfully' });
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

    const likes = await socialQueries.getPostLikes(postId);
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
    res.json({
      success: true,
      data: comment,
      moderation: {
        mode: moderationResult.mode,
        fallbackReason: moderationResult.fallbackReason,
      },
    });
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
    const { userId } = req.query;

    const comments = await socialQueries.getPostComments(postId, userId as string);
    res.json({ success: true, data: comments });
  } catch (error) {
    console.error('Get post comments error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch comments' 
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

    await socialQueries.deleteComment(commentId, userId);
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete comment' 
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
    const friendship = await socialQueries.sendFriendRequest(
      validated.requesterId, 
      validated.addresseeId, 
      validated.message
    );

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

    await socialQueries.rejectFriendRequest(friendshipId, userId);
    res.json({ success: true, message: 'Friend request rejected' });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to reject friend request' 
    });
  }
}

export async function unfriend(req: Request, res: Response) {
  try {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
      return res.status(400).json({ success: false, error: 'Both user IDs are required' });
    }

    await socialQueries.unfriend(userId, friendId);
    res.json({ success: true, message: 'Friendship removed' });
  } catch (error) {
    console.error('Unfriend error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to remove friendship' 
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

export async function getPendingFriendRequests(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    // Get all pending friend requests where this user is the requester
    const requests = await socialQueries.getPendingFriendRequests(userId);
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Get pending friend requests error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch pending friend requests' 
    });
  }
}

export async function getUserFriends(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const friends = await socialQueries.getUserFriends(userId);
    res.json({ success: true, data: friends });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch friends' 
    });
  }
}

export async function getFriendshipStatus(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;
    const otherUserId = req.query.otherUserId as string;

    if (!userId || !otherUserId) {
      return res.status(400).json({ success: false, error: 'Both userId and otherUserId are required' });
    }

    if (userId === otherUserId) {
      // Self profile – treat as no friendship record
      return res.json({ success: true, data: null });
    }

    const friendship = await socialQueries.getFriendshipStatus(userId, otherUserId);
    res.json({ success: true, data: friendship });
  } catch (error) {
    console.error('Get friendship status error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch friendship status' 
    });
  }
}

// ============= BLOCKS =============

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

    await socialQueries.unblockUser(blockerId, blockedId);
    res.json({ success: true, message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to unblock user' 
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

// ============= MUTES =============

export async function muteUser(req: Request, res: Response) {
  try {
    const { userId, mutedUserId } = req.body;

    if (!userId || !mutedUserId) {
      return res.status(400).json({ success: false, error: 'Both user IDs are required' });
    }

    const mute = await socialQueries.muteUser(userId, mutedUserId);
    res.json({ success: true, data: mute });
  } catch (error) {
    console.error('Mute user error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to mute user' 
    });
  }
}

export async function unmuteUser(req: Request, res: Response) {
  try {
    const { userId, mutedUserId } = req.body;

    if (!userId || !mutedUserId) {
      return res.status(400).json({ success: false, error: 'Both user IDs are required' });
    }

    await socialQueries.unmuteUser(userId, mutedUserId);
    res.json({ success: true, message: 'User unmuted successfully' });
  } catch (error) {
    console.error('Unmute user error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to unmute user' 
    });
  }
}

export async function getMutedUsers(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const muted = await socialQueries.getMutedUsers(userId);
    res.json({ success: true, data: muted });
  } catch (error) {
    console.error('Get muted users error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch muted users' 
    });
  }
}

// ============= NOTIFICATIONS =============

export async function getUserNotifications(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const notifications = await socialQueries.getUserNotifications(userId, limit, offset);
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch notifications' 
    });
  }
}

export async function markNotificationAsRead(req: Request, res: Response) {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    await socialQueries.markNotificationAsRead(notificationId, userId);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to mark notification as read' 
    });
  }
}

export async function markAllNotificationsAsRead(req: Request, res: Response) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    await socialQueries.markAllNotificationsAsRead(userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to mark all notifications as read' 
    });
  }
}

// ============= DIRECT MESSAGES & CONVERSATIONS =============

export async function sendMessage(req: Request, res: Response) {
  try {
    const { senderId, recipientId, content, conversationId } = req.body;

    if (!senderId || !recipientId || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Sender ID, recipient ID, and content are required' 
      });
    }

    // CONTENT MODERATION - Check message before sending
    const moderationResult = await moderateContent(content, 'ai');
    
    if (!moderationResult.isAllowed) {
      const message = getModerationMessage(moderationResult);
      return res.status(400).json({ 
        success: false, 
        error: message,
        moderationFailed: true,
        flaggedCategories: moderationResult.flaggedCategories,
      });
    }

    let finalConversationId = conversationId;

    // Create conversation if it doesn't exist
    if (!finalConversationId) {
      const conversation = await socialQueries.getOrCreateConversation(senderId, recipientId);
      finalConversationId = (conversation as any).id;
    }

    const message = await socialQueries.sendDirectMessage({
      conversationId: finalConversationId,
      senderId,
      recipientId,
      content,
      isRead: false,
    });

    res.json({
      success: true,
      data: message,
      moderation: {
        mode: moderationResult.mode,
        fallbackReason: moderationResult.fallbackReason,
      },
    });
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
    const { conversationId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const messages = await socialQueries.getConversationMessages(conversationId, limit, offset);
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch conversation' 
    });
  }
}

export async function markMessageRead(req: Request, res: Response) {
  try {
    const { messageId } = req.params;

    await socialQueries.markMessageAsRead(messageId);
    res.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to mark message as read' 
    });
  }
}

export async function getRecentConversations(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const conversations = await socialQueries.getUserConversations(userId);
    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error('Get recent conversations error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch conversations' 
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
      error: error instanceof Error ? error.message : 'Failed to fetch unread count' 
    });
  }
}

// ============= REACTIONS =============

export async function addReaction(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const { userId, emojiCode } = req.body;

    if (!userId || !emojiCode) {
      return res.status(400).json({ success: false, error: 'User ID and emoji code are required' });
    }

    const reaction = await socialQueries.addReaction(userId, postId, emojiCode);
    res.json({ success: true, data: reaction });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add reaction' 
    });
  }
}

export async function removeReaction(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const { userId, emojiCode } = req.body;

    if (!userId || !emojiCode) {
      return res.status(400).json({ success: false, error: 'User ID and emoji code are required' });
    }

    await socialQueries.removeReaction(userId, postId, emojiCode);
    res.json({ success: true, message: 'Reaction removed' });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to remove reaction' 
    });
  }
}

export async function getPostReactions(req: Request, res: Response) {
  try {
    const { postId } = req.params;

    const reactions = await socialQueries.getPostReactions(postId);
    res.json({ success: true, data: reactions });
  } catch (error) {
    console.error('Get post reactions error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch reactions' 
    });
  }
}

// ============= HASHTAGS =============

export async function searchHashtags(req: Request, res: Response) {
  try {
    const query = req.query.query as string;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Search query is required' });
    }

    const hashtags = await socialQueries.searchHashtags(query, limit);
    res.json({ success: true, data: hashtags });
  } catch (error) {
    console.error('Search hashtags error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to search hashtags' 
    });
  }
}

// ============= COMMENT REACTIONS =============

export async function addCommentReaction(req: Request, res: Response) {
  try {
    const { commentId } = req.params;
    const { userId, emojiCode } = req.body;

    console.log('🎯 addCommentReaction called:', { commentId, userId, emojiCode });

    if (!userId || !emojiCode) {
      return res.status(400).json({ success: false, error: 'User ID and emoji code are required' });
    }

    const reaction = await socialQueries.addCommentReaction(userId, commentId, emojiCode);
    console.log('✅ addCommentReaction result:', reaction);
    res.json({ success: true, data: reaction });
  } catch (error) {
    console.error('Add comment reaction error:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add comment reaction' 
    });
  }
}

export async function removeCommentReaction(req: Request, res: Response) {
  try {
    const { commentId } = req.params;
    const { userId, emojiCode } = req.body;

    if (!userId || !emojiCode) {
      return res.status(400).json({ success: false, error: 'User ID and emoji code are required' });
    }

    await socialQueries.removeCommentReaction(userId, commentId, emojiCode);
    res.json({ success: true, message: 'Comment reaction removed' });
  } catch (error) {
    console.error('Remove comment reaction error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to remove comment reaction' 
    });
  }
}

export async function getCommentReactions(req: Request, res: Response) {
  try {
    const { commentId } = req.params;

    const reactions = await socialQueries.getCommentReactions(commentId);
    res.json({ success: true, data: reactions });
  } catch (error) {
    console.error('Get comment reactions error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch comment reactions' 
    });
  }
}

// ============= CATCHES =============

export async function getUserCatches(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const catches = await socialQueries.getUserCatches(userId);
    res.json({ success: true, data: catches });
  } catch (error) {
    console.error('Get user catches error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch user catches' 
    });
  }
}
