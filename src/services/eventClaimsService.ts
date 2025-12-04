/**
 * Event Claims Service (Offline-First)
 * 
 * Local storage is the source of truth for reads (fast, offline-capable)
 * Writes update local immediately + sync to Supabase when online
 * On init/foreground, fetch server claims and merge (server wins on conflicts)
 * 
 * Based on favoriteFeaturesStore pattern: optimistic updates with server validation
 */

import { Platform } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/src/store/authStore';
import { buildApiUrl } from '@/src/utils/apiConfig';

// Storage keys
const CLAIMS_STORAGE_KEY = 'event-claims';

// Types
export interface EventClaim {
  eventKey: string;
  claimed: boolean;
  claimedAt?: string; // ISO datetime
}

export interface EventClaimsCache {
  [eventKey: string]: EventClaim;
}

/**
 * Platform-agnostic storage wrapper
 */
const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(key);
      } else {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        return await AsyncStorage.default.getItem(key);
      }
    } catch {
      return null;
    }
  },
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, value);
      } else {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.setItem(key, value);
      }
    } catch {
      // Silently fail
    }
  },
  
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
      } else {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.removeItem(key);
      }
    } catch {
      // Silently fail
    }
  },
};

/**
 * Get access token for API requests
 */
async function getAccessToken(): Promise<string | undefined> {
  try {
    const authSession = useAuthStore.getState().session;
    if (authSession?.access_token) {
      return authSession.access_token;
    }
    
    const { supabase } = await import('@/src/utils/supabaseClient');
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) console.error('[eventClaimsService] getSession error', error);
    return session?.access_token;
  } catch (err) {
    console.error('[eventClaimsService] getAccessToken error', err);
    return undefined;
  }
}

/**
 * Load claims from local storage
 */
export async function getLocalClaims(): Promise<EventClaimsCache> {
  try {
    const data = await storage.getItem(CLAIMS_STORAGE_KEY);
    if (!data) return {};
    return JSON.parse(data);
  } catch (err) {
    console.error('[eventClaimsService] getLocalClaims error', err);
    return {};
  }
}

/**
 * Get a single claim from local storage
 */
export async function getLocalClaim(eventKey: string): Promise<EventClaim | null> {
  const claims = await getLocalClaims();
  return claims[eventKey] || null;
}

/**
 * Save claims to local storage
 */
async function saveLocalClaims(claims: EventClaimsCache): Promise<void> {
  try {
    await storage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(claims));
  } catch (err) {
    console.error('[eventClaimsService] saveLocalClaims error', err);
  }
}

/**
 * Update a single claim in local storage
 */
export async function setLocalClaim(
  eventKey: string,
  claimed: boolean,
  claimedAt?: string
): Promise<void> {
  const claims = await getLocalClaims();
  claims[eventKey] = {
    eventKey,
    claimed,
    claimedAt: claimedAt || (claimed ? new Date().toISOString() : undefined),
  };
  await saveLocalClaims(claims);
}

/**
 * Fetch claims from server and merge with local
 * Server wins on conflicts (based on timestamp)
 */
export async function syncClaimsFromServer(userId: string): Promise<void> {
  try {
    const token = await getAccessToken();
    if (!token) return;
    
    const url = buildApiUrl(`event-claims?userId=${userId}`);
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (res.ok) {
      const json = await res.json();
      if (json?.data && Array.isArray(json.data)) {
        const localClaims = await getLocalClaims();
        const updatedClaims: EventClaimsCache = { ...localClaims };
        
        // Merge server claims (server wins on conflicts)
        json.data.forEach((serverClaim: any) => {
          const eventKey = serverClaim.event_key || serverClaim.eventKey;
          const claimed = serverClaim.claimed;
          const claimedAt = serverClaim.claimed_at || serverClaim.claimedAt;
          
          if (eventKey) {
            const localClaim = localClaims[eventKey];
            
            // Server wins if no local claim or server timestamp is newer
            if (!localClaim || 
                (claimedAt && (!localClaim.claimedAt || claimedAt > localClaim.claimedAt))) {
              updatedClaims[eventKey] = {
                eventKey,
                claimed,
                claimedAt,
              };
            }
          }
        });
        
        await saveLocalClaims(updatedClaims);
      }
    }
  } catch (err) {
    console.error('[eventClaimsService] syncClaimsFromServer error', err);
  }
}

/**
 * Sync a single claim to server
 */
async function syncClaimToServer(
  userId: string,
  eventKey: string,
  claimed: boolean,
  claimedAt?: string
): Promise<boolean> {
  try {
    const token = await getAccessToken();
    if (!token) return false;
    
    const url = buildApiUrl(`event-claims/${eventKey}`);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        eventKey,
        claimed,
        claimedAt: claimedAt || new Date().toISOString(),
      }),
    });
    
    return res.ok;
  } catch (err) {
    console.error('[eventClaimsService] syncClaimToServer error', err);
    return false;
  }
}

/**
 * Toggle claim status (optimistic update with server sync)
 */
export async function toggleClaim(
  eventKey: string,
  userId: string
): Promise<boolean> {
  // Get current state
  const currentClaim = await getLocalClaim(eventKey);
  const wasClaimed = currentClaim?.claimed || false;
  const newClaimedState = !wasClaimed;
  const now = new Date().toISOString();
  
  // Optimistically update local storage IMMEDIATELY
  await setLocalClaim(eventKey, newClaimedState, newClaimedState ? now : undefined);
  
  // Try to sync to server
  const success = await syncClaimToServer(userId, eventKey, newClaimedState, newClaimedState ? now : undefined);
  
  // If sync failed, revert local state
  if (!success) {
    await setLocalClaim(eventKey, wasClaimed, currentClaim?.claimedAt);
    return false;
  }
  
  return true;
}

/**
 * React hook for event claim status
 */
export function useEventClaim(eventKey: string) {
  const [claimed, setClaimed] = useState(false);
  const [claimedAt, setClaimedAt] = useState<string | undefined>();
  const [isSyncing, setIsSyncing] = useState(false);
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  
  // Load initial claim status
  const loadClaim = useCallback(async () => {
    const claim = await getLocalClaim(eventKey);
    setClaimed(claim?.claimed || false);
    setClaimedAt(claim?.claimedAt);
  }, [eventKey]);
  
  useEffect(() => {
    loadClaim();
  }, [loadClaim]);
  
  // Sync from server on mount if logged in
  useEffect(() => {
    if (userId) {
      syncClaimsFromServer(userId).then(() => loadClaim());
    }
  }, [userId, loadClaim]);
  
  // Toggle claim
  const toggle = useCallback(async () => {
    if (!userId) {
      throw new Error('AUTH_REQUIRED');
    }
    
    setIsSyncing(true);
    try {
      const success = await toggleClaim(eventKey, userId);
      if (success) {
        await loadClaim();
      }
      return success;
    } finally {
      setIsSyncing(false);
    }
  }, [eventKey, userId, loadClaim]);
  
  return {
    claimed,
    claimedAt,
    toggleClaim: toggle,
    isSyncing,
  };
}
