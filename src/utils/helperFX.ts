// Helper function to safely create a Date object
const safeCreateDate = (dateString: string): Date => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string:', dateString);
    // Return a far future date for invalid strings to avoid breaking comparisons
    return new Date('2099-12-31T23:59:59Z');
  }
  return date;
};

/**
 * Get status for Counter Events (Global Participation Challenges)
 */
export const getCounterEventStatus = (
  startDate: string,
  endDate: string,
  distributionStartDate: string,
  distributionEndDate: string
): 'active' | 'upcoming' | 'limbo' | 'distribution' | 'ended' => {
  const now = new Date();
  const start = safeCreateDate(startDate);
  const end = safeCreateDate(endDate);
  const distributionStart = safeCreateDate(distributionStartDate);
  const distributionEnd = safeCreateDate(distributionEndDate);

  if (now < start) return 'upcoming';
  if (now < end) return 'active';
  if (now > end && now < distributionStart) return 'limbo';
  if (now > distributionStart && now < distributionEnd) return 'distribution';
  return 'ended';
};

/**
 * Get status for Tera Raid Events (handles dual periods)
 */
export const getTeraRaidStatus = (
  period1Start: string,
  period1End: string,
  period2Start?: string,
  period2End?: string
): 'period1-active' | 'period1-ended' | 'period2-active' | 'ended' => {
  const now = new Date();
  const p1Start = safeCreateDate(period1Start);
  const p1End = safeCreateDate(period1End);
  
  // Check period 1
  if (now >= p1Start && now <= p1End) {
    return 'period1-active';
  }
  
  // If there's a period 2, check it
  if (period2Start && period2End) {
    const p2Start = safeCreateDate(period2Start);
    const p2End = safeCreateDate(period2End);
    
    if (now >= p2Start && now <= p2End) {
      return 'period2-active';
    }
    
    // If we're between periods
    if (now > p1End && now < p2Start) {
      return 'period1-ended';
    }
    
    // After period 2 ends
    if (now > p2End) {
      return 'ended';
    }
  }
  
  // After period 1 (and no period 2 or before period 2)
  if (now > p1End) {
    return period2Start ? 'period1-ended' : 'ended';
  }
  
  return 'ended';
};

/**
 * Get status for Mystery Gift Events
 */
export const getMysteryGiftStatus = (
  startDate: string,
  endDate: string,
  isOngoing?: boolean
): 'active' | 'upcoming' | 'ended' => {
  if (isOngoing) return 'active'; // Ongoing events are always active
  
  const now = new Date();
  const start = safeCreateDate(startDate);
  const end = safeCreateDate(endDate);
  
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'active';
};

/**
 * Get status for Promo Code Events
 */
export const getPromoCodeStatus = (
  expirationDate: string
): 'active' | 'expired' => {
  const now = new Date();
  const expiration = safeCreateDate(expirationDate);
  
  return now > expiration ? 'expired' : 'active';
};

// Keep old name for backward compatibility (deprecated)
/** @deprecated Use getCounterEventStatus instead */
export const getEventStatus = getCounterEventStatus;