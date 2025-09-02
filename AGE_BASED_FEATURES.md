# Age-Based User Features Documentation

## Overview
This app implements a comprehensive age-based user management system to ensure compliance with digital safety requirements and provide age-appropriate features.

## Age Requirements
- **13+ years**: Access to social features (social tab, social interactions)
- **18+ years**: Adult status (future adult-only features)
- **Under 13**: Basic app features only, no social interactions

## Implementation Details

### Core Files Modified

#### 1. Authentication Store (`src/utils/authStore.ts`)
- Enhanced with profile management including birthdate field
- Dynamic age calculation functions: `calculateIsAdult()` and `canAccessSocial()`
- Computed properties for real-time age-based permissions
- No stored boolean age flags (calculated dynamically for accuracy)

#### 2. Profile Management (`src/components/Account.tsx`)
- Unified profile editing and signup component
- Required birthdate field for new users
- Age-aware UI text and button labels
- Form validation for profile completeness

#### 3. Social Feature Protection (`src/app/(drawer)/social/_layout.tsx`)
- Age-based routing protection
- Different UI states for:
  - Users under 13: Age requirement message
  - Users 13+: Full social access
  - Signed-out users: Authentication prompt

#### 4. Navigation Indicators (`src/app/(drawer)/_layout.tsx`)
- Visual age indicators in drawer navigation
- Social tab shows "(13+)" for users who can't access social features
- Clear indication of restricted features

#### 5. Age Utility Hook (`src/utils/useUserAge.ts`)
- Convenient hook for components to check age-based permissions
- Returns computed booleans: `isAdult`, `canUseSocialFeatures`, `shouldShowSocialTab`
- Subscribes to auth store changes for reactive updates

### Privacy and Compliance

#### Google Play Data Safety
- Birthdate collected only for age verification
- No personal data shared with third parties
- Age-appropriate feature restrictions enforced

#### Privacy Policy Updates
- All contact emails updated to `support@pokepages.app`
- Clear age requirement disclosures
- Data collection transparency

## User Flow Examples

### New User Signup
1. User signs up with email/OAuth
2. Directed to profile setup requiring birthdate
3. Age calculated and permissions set automatically
4. Navigation and features adjust based on age

### Existing User Experience
- Users under 13: Basic app features, social tab shows restriction
- Users 13-17: Full social access, marked as minor
- Users 18+: Full access with adult status

### Age Verification
- Dynamic calculation prevents stored age data inaccuracy
- Birthdate changes (rare) automatically update permissions
- Real-time age progression (birthdays) handled automatically

## Testing Scenarios

To test the age-based system:

1. **Create test users** with different birthdates:
   - Born in 2000 (24+ years, adult, social access)
   - Born in 2007 (17 years, minor, social access)
   - Born in 2011 (13 years, minor, social access)
   - Born in 2012 (12 years, minor, no social access)

2. **Verify navigation**:
   - Check drawer social tab labels
   - Test social tab routing restrictions
   - Verify age-appropriate messages

3. **Test edge cases**:
   - Users without birthdates
   - Invalid birthdate formats
   - Users approaching age thresholds

## Future Enhancements

- Adult-only content features (18+)
- Parental consent flows for users under 13
- Age verification documents for sensitive features
- More granular age-based permissions

## Maintenance Notes

- Age calculations use JavaScript Date objects
- Birthdate stored as ISO string in Supabase profiles table
- Age computed on every auth store access (minimal performance impact)
- No cached age values to prevent accuracy issues
