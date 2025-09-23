import { useAuthStore } from '../store/authStore';

/**
 * Hook to get user age-related information
 * Returns computed values based on the user's birthdate in their profile
 */
export const useUserAge = () => {
  const { profile, isAdult, canUseSocialFeatures, isLoggedIn } = useAuthStore();
  
  return {
    // Raw profile data
    birthdate: profile?.birthdate,
    hasProvidedBirthdate: !!profile?.birthdate,
    
    // Computed age-related booleans
    isAdult, // 18+ years old
    canUseSocialFeatures, // 13+ years old
    
    // Helper booleans for UI logic
    canCreateAccount: !isLoggedIn, // Anyone can create an account, but we validate age server-side
    shouldShowSocialTab: isLoggedIn && canUseSocialFeatures,
    shouldShowAgeWarning: isLoggedIn && profile && !canUseSocialFeatures,
    
    // User status
    isLoggedIn,
  };
};
