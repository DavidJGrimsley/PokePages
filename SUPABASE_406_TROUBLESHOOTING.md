# Supabase 406 Error Troubleshooting Guide

## Changes Made

### 1. Updated Supabase Client Configuration
✅ **Added explicit headers** in `src/utils/supabaseClient.ts`:
```typescript
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
  // Add explicit headers for content negotiation
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
});
```

### 2. Enhanced Query in EventCounter
✅ **Updated user participation query** in `src/components/EventCounter.tsx`:
- Added explicit column selection: `'contribution_count, event_id, user_id'`
- Enhanced error logging with full error details
- Added response status and statusText logging

### 3. Created Diagnostic Tools
✅ **Added diagnostic utilities** in `src/utils/supabaseDiagnostics.ts`:
- Connection testing
- Query testing with detailed error reporting
- Session validation
- Table access verification

✅ **Created API test component** in `src/components/SupabaseAPITester.tsx`:
- Manual API testing interface
- Direct fetch simulation
- Comprehensive error reporting

## Next Steps for Debugging

### 1. Check Environment Variables
Verify your environment variables are properly set:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### 2. Test the Fixed Implementation
1. Run your app and check the console logs
2. Look for the enhanced error messages in the browser/device console
3. The logs will now show:
   - Event ID and User ID with their types
   - Full error details including code, message, hint
   - Response status and statusText

### 3. Verify Database Setup
Check your Supabase dashboard:
1. **Table exists**: Verify `user_event_participation` table exists
2. **Columns match**: Ensure these columns exist:
   - `contribution_count`
   - `event_id` (UUID)
   - `user_id` (UUID)
3. **RLS policies**: Check Row Level Security policies
4. **API exposure**: Ensure table is exposed in the API

### 4. Manual API Testing
1. Import and use the `SupabaseAPITester` component in your app
2. Enter valid Event ID and User ID (UUIDs)
3. Run the tests to see detailed API responses

### 5. Common Issues to Check

#### Issue: Invalid UUID Format
- Ensure `eventData.id` and `user.id` are valid UUIDs
- Check console logs for ID types and values

#### Issue: RLS Policy Problems
- Verify authenticated users can read from `user_event_participation`
- Check if policies allow the specific query conditions

#### Issue: Missing Environment Variables
- Ensure `.env` variables are properly loaded
- Verify variable names match exactly

#### Issue: Network/CORS Problems
- Check if requests are being blocked
- Verify Supabase project URL is correct

## Console Commands for Further Debugging

### Check current session:
```javascript
supabase.auth.getSession().then(console.log);
```

### Test basic query:
```javascript
supabase.from('user_event_participation').select('count').then(console.log);
```

### Test with explicit headers:
```javascript
supabase
  .from('user_event_participation')
  .select('contribution_count, event_id, user_id')
  .limit(1)
  .then(console.log);
```

## Expected Console Output
After the changes, you should see detailed logs like:
```
🔍 Loading event data for: [eventKey]
✅ Event data loaded: {...}
🔍 Loading user participation...
Event ID: [uuid] Type: string
User ID: [uuid] Type: string
User participation response status: 200
User participation response statusText: OK
✅ User participation loaded: {...}
```

If there's still a 406 error, the logs will show the full error details to help identify the root cause.
