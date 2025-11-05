# Onboarding Return Navigation Implementation

## Summary
Implemented a feature that remembers where users came from before starting the onboarding flow and redirects them back to that location after completion. This is especially important for web users who are automatically sent through onboarding when they sign in.

## Problem
Previously, when a user clicked "Sign In" from any page (e.g., EventCounter), they would:
1. Navigate to `/sign-in`
2. Complete authentication
3. Get automatically sent through onboarding (on web)
4. End up on the home screen instead of the original page they were on

## Solution

### 1. Updated Onboarding Store
**File:** `src/store/onboardingStore.ts`

Added new state and methods to track the return URL:
- `returnUrl: string | null` - Stores where the user should return after onboarding
- `setReturnUrl: (url: string | null) => void` - Sets the return URL
- Updated `resetOnboarding()` to clear the `returnUrl`

### 2. Created Navigation Hook
**File:** `src/hooks/useNavigateToSignIn.ts`

Created a custom hook `useNavigateToSignIn()` that:
- Captures the current route before navigating to sign-in
- Stores it in the onboarding store (only if it's not a sign-in/sign-up/onboarding page)
- Navigates to the sign-in page

### 3. Updated Final Onboarding Screen
**File:** `src/app/(onboarding)/final.tsx`

Modified `handleCompleteOnboarding()` to:
- Check if there's a stored `returnUrl`
- Navigate to that URL if it exists
- Fall back to `/(drawer)` (home) if no return URL is stored
- Clear the return URL after use

### 4. Updated Components Using Sign-In Navigation

Updated the following components to use the new `useNavigateToSignIn` hook instead of directly calling `router.push('/sign-in')`:

- **`src/components/Auth/AuthStatus.tsx`** - Sign-in button in auth status banner
- **`src/components/EventCounter.tsx`** - Sign-in prompt in event counter
- **`src/components/Auth/OAuth.tsx`** - Sign-in button in OAuth component

### 5. Updated Auth Callbacks
**Files:** 
- `src/app/auth/callback.tsx`
- `src/app/auth/callback-v2.tsx`

Updated callbacks to properly handle the onboarding flow by letting the `_layout` manage showing onboarding when needed.

## How It Works

### Flow Example:

1. **User on Event Counter Page** (`/(drawer)/events/wo-chien`)
   - Clicks "Sign in to sync your progress"
   
2. **useNavigateToSignIn Hook**
   - Captures current path: `/(drawer)/events/wo-chien`
   - Stores it in `onboardingStore.returnUrl`
   - Navigates to `/sign-in`

3. **User Signs In**
   - On web: Automatically redirected through onboarding (due to `_layout` logic)
   - On native: May or may not see onboarding based on completion status

4. **Onboarding Final Screen**
   - User completes onboarding
   - `handleCompleteOnboarding()` retrieves stored URL
   - Redirects to `/(drawer)/events/wo-chien` instead of home
   - Clears the return URL

5. **User Returns to Original Page** ✅

## Edge Cases Handled

1. **No Return URL**: Falls back to home screen `/(drawer)`
2. **Already on auth pages**: Doesn't store auth pages as return URLs
3. **Onboarding pages**: Doesn't store onboarding pages as return URLs
4. **Root path**: Doesn't store root path as return URL
5. **Clear after use**: Return URL is cleared after navigation to prevent stale redirects

## Files Modified

1. `src/store/onboardingStore.ts` - Added returnUrl state
2. `src/hooks/useNavigateToSignIn.ts` - NEW: Created navigation hook
3. `src/app/(onboarding)/final.tsx` - Updated completion handler
4. `src/components/Auth/AuthStatus.tsx` - Uses new hook
5. `src/components/EventCounter.tsx` - Uses new hook
6. `src/components/Auth/OAuth.tsx` - Uses new hook
7. `src/app/auth/callback.tsx` - Updated for onboarding flow
8. `src/app/auth/callback-v2.tsx` - Updated for onboarding flow

## Testing Recommendations

1. **Test on Web:**
   - Navigate to any event counter page
   - Click "Sign in"
   - Complete sign-in process
   - Verify onboarding shows
   - Complete onboarding
   - Verify you return to the event counter page

2. **Test on Native:**
   - Same flow as web
   - Verify behavior with and without completed onboarding

3. **Test Edge Cases:**
   - Sign in from home screen (should return to home)
   - Sign in from within onboarding flow
   - Sign in when already signed in
   - Sign out and sign in again

## Future Enhancements

- Could extend to support query parameters in return URLs
- Could add a maximum age for stored return URLs
- Could add return URL preview in onboarding final screen
