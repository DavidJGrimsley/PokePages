import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '~/store/authStore';
import * as socialApi from '~/utils/socialApi';

export interface NotificationCounts {
  unreadMessages: number;
  friendRequests: number;
  total: number;
}

/**
 * Custom hook to track notification badge counts for messages and alerts
 * Returns counts for unread messages, friend requests, and a total
 */
export function useNotificationBadge(refreshInterval: number = 30000) {
  const { user } = useAuthStore();
  const [counts, setCounts] = useState<NotificationCounts>({
    unreadMessages: 0,
    friendRequests: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    if (!user?.id) {
      setCounts({ unreadMessages: 0, friendRequests: 0, total: 0 });
      setLoading(false);
      return;
    }

    try {
      const [unreadCount, friendRequests] = await Promise.all([
        socialApi.getUnreadMessagesCount(user.id),
        socialApi.getFriendRequests(user.id),
      ]);

      const newCounts = {
        unreadMessages: unreadCount,
        friendRequests: friendRequests.length,
        total: unreadCount + friendRequests.length,
      };

      setCounts(newCounts);
    } catch (error) {
      console.error('[useNotificationBadge] Failed to fetch notification counts:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCounts();

    // Set up polling for updates
    const interval = setInterval(fetchCounts, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchCounts, refreshInterval]);

  return { counts, loading, refresh: fetchCounts };
}
