# Profile System Migration Instructions

## Run the Migration

To add the `social_link` column to the profiles table, you need to run the migration in your Supabase SQL Editor:

### Option 1: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `migrations/add_social_link_to_profiles.sql`:
   ```sql
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_link TEXT;
   COMMENT ON COLUMN profiles.social_link IS 'URL to one social media platform of user''s choice';
   ```
5. Click "Run" to execute the migration

### Option 2: Supabase CLI (if you have it set up)
```bash
supabase db push
```

## Verify Migration
After running the migration, verify it worked:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'social_link';
```

You should see:
```
column_name | data_type
------------|----------
social_link | text
```

## Next Steps
Once the migration is complete, restart your Express server:

```bash
npm run start:server
```

Then test the profile system:
1. Navigate to `/profile/preview` to view your profile
2. Click "Edit Profile" and add a bio and social link
3. Navigate to `/profile/[userId]` to view another user's profile

## Features Now Available
- ✅ Bio field with 50-word limit and word counter
- ✅ Social link field for one social platform
- ✅ Catches gallery (displays user's Pokémon catches)
- ✅ Profile preview page (own profile)
- ✅ User profile page (view other users)
- ✅ Friend actions (add, unfriend, message, block)
