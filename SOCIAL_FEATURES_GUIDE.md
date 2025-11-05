# PokePages Social Features Implementation Guide

## 🎉 What's Been Created

I've built a comprehensive social networking system for your PokePages app with all the features you requested!

### ✅ Completed Features

1. **Database Schema** (`src/db/socialSchema.ts`)
   - Posts (with visibility control)
   - Friendships (friend requests, blocking)
   - Likes
   - Comments
   - Messages (friend request messages only)

2. **Database Queries** (`src/db/socialQueries.ts`)
   - All CRUD operations for posts, friendships, likes, comments, and messages
   - Smart feed queries (Explore & Friends feeds)
   - Friend request management
   - User blocking/unblocking
   - Conversation management

3. **API Routes** (`src/routes/social/`)
   - Controllers (`socialController.ts`)
   - Route definitions (`index.ts`)
   - Integrated into main server (`server.ts`)

4. **Frontend API Client** (`src/utils/socialApi.ts`)
   - TypeScript interfaces for all data types
   - Complete API client functions for all endpoints

5. **UI Components**
   - `PostCard` component with like/comment/share/delete actions
   - Feed tab with Explore/Friends toggle
   - Create Post tab with visibility controls
   - Messages tab (placeholder for now)

## 📋 Next Steps to Complete

### 1. Run Database Migration

You need to create and run a Drizzle migration to add the new tables to your database:

```bash
# Generate migration
npx drizzle-kit generate

# Apply migration
npx drizzle-kit push
```

### 2. Features to Implement

#### A. **Tom from MySpace Feature** 👥
Create a special "default friend" system:

```typescript
// In your user registration flow:
const TOM_USER_ID = 'your-tom-account-uuid-here'; // Create this account first

async function onUserSignup(newUserId: string) {
  // Automatically friend every new user with Tom
  await socialApi.sendFriendRequest(TOM_USER_ID, newUserId, 
    "Welcome to PokePages! I'm here to help you get started! 🎮");
  await socialApi.acceptFriendRequest(friendshipId, newUserId);
}
```

#### B. **Messages Tab** 📨
Currently a placeholder. Implement:
- List of conversations with unread counts
- Individual conversation view
- Real-time message updates (consider using WebSockets or polling)

**Create**: `src/app/(drawer)/social/(tabs)/messages.tsx`
```typescript
// Use these API calls:
- getRecentConversations(userId)
- getConversation(userId, otherUserId)
- sendMessage(senderId, recipientId, content, friendshipId)
- markConversationAsRead(userId, otherUserId)
```

#### C. **Post Comments Screen** 💬
Create a detailed post view with comments:

**Create**: `src/app/(drawer)/social/post/[id].tsx`
```typescript
// Features:
- Full post display
- Comments list
- Add comment input
- Delete own comments
```

#### D. **User Profile Screen** 👤
View other users' profiles:

**Create**: `src/app/(drawer)/social/user/[id].tsx`
```typescript
// Features:
- User info display
- Their posts
- Friend/Unfriend/Block buttons
- Check friendship status
```

#### E. **Friend Requests Notification** 🔔
Add a badge to show pending friend requests:

```typescript
// In your main navigation:
import { getFriendRequests } from '~/utils/socialApi';

// Show count badge on Social tab
const [requestCount, setRequestCount] = useState(0);

useEffect(() => {
  loadFriendRequests();
}, []);
```

#### F. **Share to External Platforms** 🔗
Implement the `onShare` callback in PostCard to share to:
- Twitter/X
- Facebook
- Instagram Stories
- Copy link to clipboard

```typescript
import * as Sharing from 'expo-sharing';

async function sharePost(post: Post) {
  // Generate deep link to post
  const postUrl = `https://pokepages.app/post/${post.id}`;
  
  await Share.share({
    message: `Check out this post: ${postUrl}`,
    url: postUrl,
  });
}
```

### 3. Add Missing Dependencies

Make sure you have these installed:

```bash
npm install date-fns
# or
yarn add date-fns
```

### 4. Environment Variables

Ensure your `.env` file has:
```
EXPO_PUBLIC_API_URL=http://localhost:3001
DATABASE_URL=your_supabase_connection_string
```

## 🎨 Design Features

The UI is designed to be:
- **Special & Inviting**: Rounded corners, gradients, emojis, shadows
- **Pokémon-themed**: Amber/yellow accent colors, playful language
- **Dark mode compatible**: All components support dark mode
- **Mobile-first**: Touch-friendly, smooth animations

## 🔒 Security Considerations

1. **Add Authentication Middleware**: Protect routes by verifying user sessions
2. **Rate Limiting**: Add rate limits to prevent spam
3. **Content Moderation**: Consider adding profanity filters
4. **Image Uploads**: Implement secure image upload (not yet in schema)
5. **Report System**: Add ability to report inappropriate content

## 📝 API Endpoints Reference

### Posts
- `POST /social/posts` - Create post
- `GET /social/posts/:postId` - Get single post
- `GET /social/posts/feed/explore` - Get explore feed
- `GET /social/posts/feed/friends` - Get friends feed
- `GET /social/posts/user/:userId` - Get user's posts
- `PUT /social/posts/:postId` - Update post
- `DELETE /social/posts/:postId` - Delete post

### Friendships
- `POST /social/friendships/request` - Send friend request
- `POST /social/friendships/:friendshipId/accept` - Accept request
- `POST /social/friendships/:friendshipId/reject` - Reject request
- `DELETE /social/friendships/:friendshipId` - Remove friend
- `POST /social/friendships/block` - Block user
- `POST /social/friendships/unblock` - Unblock user
- `GET /social/friendships/requests` - Get friend requests
- `GET /social/friendships/friends` - Get friends list
- `GET /social/friendships/blocked` - Get blocked users
- `GET /social/friendships/status` - Check friendship status

### Likes
- `POST /social/posts/:postId/like` - Like post
- `DELETE /social/posts/:postId/like` - Unlike post
- `GET /social/posts/:postId/likes` - Get post likes

### Comments
- `POST /social/posts/:postId/comments` - Create comment
- `GET /social/posts/:postId/comments` - Get post comments
- `PUT /social/comments/:commentId` - Update comment
- `DELETE /social/comments/:commentId` - Delete comment

### Messages
- `POST /social/messages` - Send message
- `GET /social/messages/conversation` - Get conversation
- `GET /social/messages/unread-count` - Get unread count
- `POST /social/messages/:messageId/read` - Mark as read
- `POST /social/messages/conversation/read` - Mark conversation as read
- `GET /social/messages/conversations` - Get recent conversations

## 🚀 Testing the Features

1. **Start your server**:
   ```bash
   npm run dev
   # or
   node server.js
   ```

2. **Test endpoints**:
   - Health check: `http://localhost:3001/test`
   - DB check: `http://localhost:3001/test-db`
   - Social endpoints: `http://localhost:3001/social/*`

3. **Create test data**:
   - Sign in with a user
   - Create some posts
   - Send friend requests
   - Test the feeds

## 🐛 Troubleshooting

1. **TypeScript errors**: Run `npm run typecheck`
2. **Database connection issues**: Check `DATABASE_URL` in `.env`
3. **API not responding**: Make sure server is running on port 3001
4. **Posts not loading**: Check browser console/React Native debugger for errors

## 🎯 Future Enhancements

- Image upload for posts
- GIF support
- Post reactions (beyond just likes)
- Hashtag system
- Mention users in posts
- Push notifications for messages/likes/comments
- Stories feature (24-hour posts)
- Polls
- Save/bookmark posts
- Trending posts algorithm
- Search users and posts

---

**You're now ready to build an amazing social experience for PokePages trainers! 🚀✨**
