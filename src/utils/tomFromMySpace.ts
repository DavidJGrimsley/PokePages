/**
 * Tom from MySpace Feature
 * 
 * This utility automatically friends new users with a special "Tom" account,
 * just like the original MySpace experience!
 */

import * as socialApi from './socialApi';

// The UUID of your "Tom" account
// Create this account first through your normal signup flow
export const TOM_USER_ID = 'YOUR_TOM_ACCOUNT_UUID_HERE';

// Tom's welcome messages (randomly selected)
const WELCOME_MESSAGES = [
  "Welcome to PokePages! I'm here to help you get started on your journey! 🎮",
  "Hey there, trainer! Ready to catch 'em all and make some friends? Let's go! ✨",
  "Welcome aboard! Your Pokémon adventure starts now. Need any help? I'm your first friend! 🚀",
  "Glad you joined us! Can't wait to see what amazing teams you'll build! 💪",
  "Welcome to the community! Let me know if you need anything. Happy training! 🌟",
];

/**
 * Automatically friend a new user with Tom
 * Call this after successful user registration
 */
export async function autoFriendWithTom(newUserId: string): Promise<void> {
  try {
    // Don't friend Tom with himself
    if (newUserId === TOM_USER_ID) {
      return;
    }

    // Pick a random welcome message
    const message = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];

    // Send friend request from Tom
    const friendship = await socialApi.sendFriendRequest(
      TOM_USER_ID,
      newUserId,
      message
    );

    // Automatically accept the request (since it's from Tom)
    await socialApi.acceptFriendRequest(friendship.id, newUserId);

    console.log(`✅ New user ${newUserId} is now friends with Tom!`);
  } catch (error) {
    console.error('❌ Error friending new user with Tom:', error);
    // Don't throw - we don't want to fail signup if this fails
  }
}

/**
 * Create the Tom account (run once during setup)
 * You should manually create Tom's account with:
 * - Username: "Tom" or "PokePages_Official" 
 * - Nice avatar image
 * - Bio: "Your first friend on PokePages! 👋"
 */
export async function setupTomAccount() {
  console.log(`
    ═══════════════════════════════════════════════════
    🎮 Tom Account Setup Instructions
    ═══════════════════════════════════════════════════
    
    1. Create a new account through your app
       - Username: "Tom" or "PokePages_Tom"
       - Add a friendly avatar image
       - Bio: "Your first friend on PokePages! 👋"
    
    2. Copy the user's UUID
    
    3. Update TOM_USER_ID in this file:
       src/utils/tomFromMySpace.ts
    
    4. Add to your signup flow:
       import { autoFriendWithTom } from '~/utils/tomFromMySpace';
       
       // After successful signup:
       await autoFriendWithTom(newUser.id);
    
    ═══════════════════════════════════════════════════
  `);
}

/**
 * Example: Integrate into your signup flow
 */
export function exampleSignupIntegration() {
  /*
  
  // In your signup/registration function:
  
  import { autoFriendWithTom } from '~/utils/tomFromMySpace';
  
  async function handleUserSignup(userData: SignupData) {
    try {
      // 1. Create user account
      const newUser = await createUserAccount(userData);
      
      // 2. Create user profile
      const profile = await createUserProfile(newUser.id, userData);
      
      // 3. Auto-friend with Tom! 🎉
      await autoFriendWithTom(newUser.id);
      
      // 4. Continue with your signup flow
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error };
    }
  }
  
  */
}

/**
 * Bonus: Tom's featured posts
 * You can periodically post as Tom to engage users
 */
export const TOM_POST_IDEAS = [
  {
    content: "🎉 Welcome to all our new trainers this week! Don't forget to check out the Resources tab for helpful guides!",
    visibility: 'public' as const,
  },
  {
    content: "💡 Pro Tip: Build a balanced team with different types! Share your best team compositions in the feed!",
    visibility: 'public' as const,
  },
  {
    content: "🌟 Community Spotlight: We've seen some amazing builds this week! Keep sharing and supporting each other!",
    visibility: 'public' as const,
  },
  {
    content: "🎮 Weekly Challenge: Share your most creative Pokémon nickname! Mine is calling my Pikachu 'Sparky McZapface' 😄",
    visibility: 'public' as const,
  },
  {
    content: "👥 Remember: The PokePages community is built on respect and kindness. Be awesome to each other, trainers!",
    visibility: 'public' as const,
  },
];

/**
 * Post as Tom (for admin/automated posting)
 */
export async function tomPost(content: string, visibility: 'public' | 'friends_only' = 'public') {
  try {
    const { post, moderation } = await socialApi.createPost(TOM_USER_ID, content, visibility);
    console.log('✅ Tom posted:', content.substring(0, 50) + '...');
    if (moderation?.mode === 'basic' && moderation.fallbackReason) {
      console.warn(`Tom's post used basic moderation: ${moderation.fallbackReason}`);
    }
    return post;
  } catch (error) {
    console.error('❌ Error posting as Tom:', error);
    throw error;
  }
}

// Run this to see setup instructions
if (require.main === module) {
  setupTomAccount();
}
