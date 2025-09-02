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

export const getEventStatus = (
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

  console.log('now:', now);
  console.log('start:', start);
  console.log('end:', end);
  console.log('distributionStart:', distributionStart);
  console.log('distributionEnd:', distributionEnd);

  if (now < start) return 'upcoming';
  if (now < end) return 'active';
  if (now > end && now < distributionStart) return 'limbo';
  if (now > distributionStart && now < distributionEnd) return 'distribution';
  return 'ended';
};