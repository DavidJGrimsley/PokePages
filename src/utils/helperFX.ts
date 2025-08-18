export const getEventStatus = (
  startDate: string,
  endDate: string,
  distributionStartDate: string,
  distributionEndDate: string
): 'active' | 'upcoming' | 'limbo' | 'distribution' | 'ended' => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  const distributionStart = new Date(distributionStartDate);
  const distributionEnd = new Date(distributionEndDate);

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