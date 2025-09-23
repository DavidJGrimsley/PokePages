/**
 * Test the age calculation functions
 * Run this in a development environment to verify the age logic works correctly
 */

// Helper function to calculate if user is adult (18+) based on birthdate
const calculateIsAdult = (birthdate: string | null): boolean => {
  if (!birthdate) return false;
  
  try {
    const birth = new Date(birthdate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  } catch (error) {
    console.error('Error calculating age from birthdate:', error);
    return false;
  }
};

// Helper function to check if user can access social features (13+)
const canAccessSocial = (birthdate: string | null): boolean => {
  if (!birthdate) return false;
  
  try {
    const birth = new Date(birthdate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 >= 13;
    }
    return age >= 13;
  } catch (error) {
    console.error('Error calculating age for social access:', error);
    return false;
  }
};

// Test cases
const testCases = [
  { birthdate: null, expectedAdult: false, expectedSocial: false, description: 'No birthdate provided' },
  { birthdate: '2000-01-01', expectedAdult: true, expectedSocial: true, description: '24+ years old' },
  { birthdate: '2006-01-01', expectedAdult: true, expectedSocial: true, description: '18+ years old' },
  { birthdate: '2007-01-01', expectedAdult: false, expectedSocial: true, description: '17 years old (can access social)' },
  { birthdate: '2011-01-01', expectedAdult: false, expectedSocial: true, description: '13+ years old' },
  { birthdate: '2012-01-01', expectedAdult: false, expectedSocial: false, description: 'Under 13 years old' },
  { birthdate: 'invalid-date', expectedAdult: false, expectedSocial: false, description: 'Invalid birthdate' },
];

console.log('🧪 Testing Age Calculation Functions');
console.log('=====================================');

testCases.forEach((testCase, index) => {
  const actualAdult = calculateIsAdult(testCase.birthdate);
  const actualSocial = canAccessSocial(testCase.birthdate);
  
  const adultPass = actualAdult === testCase.expectedAdult;
  const socialPass = actualSocial === testCase.expectedSocial;
  
  console.log(`\nTest ${index + 1}: ${testCase.description}`);
  console.log(`  Birthdate: ${testCase.birthdate}`);
  console.log(`  Adult (18+): ${actualAdult} ${adultPass ? '✅' : '❌'}`);
  console.log(`  Social (13+): ${actualSocial} ${socialPass ? '✅' : '❌'}`);
});

console.log('\n🎉 Age calculation tests completed!');

export { calculateIsAdult, canAccessSocial };
