// Social utility functions for loading and managing social data
import * as socialApi from './socialApi';
import type { Comment, ReactionType } from './socialApi';

/**
 * Load comments for a specific post
 */
export async function loadPostComments(
  postId: string,
  userId: string,
  limit = 50,
  offset = 0
): Promise<Comment[]> {
  try {
    const comments = await socialApi.getPostComments(postId, limit, offset, userId);
    return comments;
  } catch (err) {
    console.error('Failed to load comments:', err);
    throw err;
  }
}

/**
 * Create a new comment on a post
 */
export async function createPostComment(
  postId: string,
  userId: string,
  content: string
): Promise<Comment> {
  try {
    const comment = await socialApi.createComment(postId, userId, content);
    return comment;
  } catch (err) {
    console.error('Failed to create comment:', err);
    throw err;
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(
  commentId: string,
  userId: string
): Promise<void> {
  try {
    await socialApi.deleteComment(commentId, userId);
  } catch (err) {
    console.error('Failed to delete comment:', err);
    throw err;
  }
}

/**
 * Handle comment reaction (add, remove, or change)
 * Returns updated comment reactions for optimistic UI updates
 */
export async function handleCommentReaction(
  commentId: string,
  userId: string,
  reactionType: ReactionType,
  currentReaction: ReactionType | null
): Promise<{ action: 'add' | 'remove' | 'change'; oldReaction?: ReactionType }> {
  try {
    if (currentReaction === reactionType) {
      // Remove reaction
      await socialApi.removeCommentReaction(commentId, userId, reactionType);
      return { action: 'remove' };
    } else {
      // Add or change reaction
      if (currentReaction) {
        await socialApi.removeCommentReaction(commentId, userId, currentReaction);
      }
      await socialApi.addCommentReaction(commentId, userId, reactionType);
      return { action: currentReaction ? 'change' : 'add', oldReaction: currentReaction || undefined };
    }
  } catch (err) {
    console.error('Failed to handle comment reaction:', err);
    throw err;
  }
}

