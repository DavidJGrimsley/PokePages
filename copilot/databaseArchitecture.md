# Database Architecture with Drizzle ORM & Supabase

## Overview
PokePages uses a modern database stack combining **Drizzle ORM** for type-safe queries and **Supabase** (PostgreSQL) for the database backend. This provides a robust, scalable, and developer-friendly data layer.

## Tech Stack

- **Drizzle ORM** - TypeScript-first ORM with full type inference
- **Supabase** - Backend as a Service with PostgreSQL
- **PostgreSQL** - Relational database
- **postgres.js** - Fast PostgreSQL client for Node.js

## Why This Stack?

### Drizzle ORM Benefits
✅ **Type-safe** - Full TypeScript inference from schema to queries
✅ **SQL-like** - Familiar SQL syntax, not abstracted away
✅ **Lightweight** - Minimal runtime overhead
✅ **Automatic migrations** - Schema changes generate migrations
✅ **Zero dependencies** - No heavy ORM baggage
✅ **Excellent DX** - Auto-completion and type checking
✅ **Performance** - Generates efficient SQL queries

### Supabase Benefits
✅ **PostgreSQL** - Industry-standard relational database
✅ **Real-time subscriptions** - WebSocket updates
✅ **Built-in auth** - Authentication and user management
✅ **Row Level Security** - Database-level permissions
✅ **Connection pooling** - PgBouncer for scalability
✅ **Automatic backups** - Point-in-time recovery
✅ **REST & GraphQL APIs** - Auto-generated from schema

## Database Architecture

### Schema Organization
```
src/db/
├── eventsSchema.ts           # Event tracking (Pokémon events)
├── eventClaimsSchema.ts      # User event claims
├── profilesSchema.ts         # User profiles
├── legendsZATrackerSchema.ts # Legends Z-A Pokédex tracker
├── socialSchema.ts           # Social features (posts, comments, etc.)
├── favoritesSchema.ts        # User favorites
├── relations.ts              # Table relationships
├── *Queries.ts               # Query functions per schema
└── index.ts                  # Database connection & setup
```

### Schema Pattern
Each schema file contains:
1. **Table definition** - Structure with Drizzle schema builder
2. **Type exports** - Inferred TypeScript types
3. **Zod validators** - Runtime validation schemas

## Example Schema Implementation

### 1. Define Schema (`eventsSchema.ts`)
```typescript
import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  pokemon: text('pokemon').notNull().unique(),
  totalClaims: integer('total_claims').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types inferred from schema
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

// Zod schemas for runtime validation
export const insertEventSchema = createInsertSchema(events);
export const selectEventSchema = createSelectSchema(events);

// Custom validation rules
export const eventValidation = insertEventSchema.extend({
  pokemon: z.string().min(1).max(50),
});
```

### 2. Create Query Functions (`eventsQueries.ts`)
```typescript
import { eq, desc } from 'drizzle-orm';
import { db } from './index';
import { events, type Event, type NewEvent } from './eventsSchema';

// Get all events
export async function getEvents(): Promise<Event[]> {
  return db.select().from(events).orderBy(desc(events.createdAt));
}

// Get event by pokemon name
export async function getEvent(pokemon: string): Promise<Event | undefined> {
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.pokemon, pokemon))
    .limit(1);
  return event;
}

// Create new event
export async function createEvent(data: NewEvent): Promise<Event> {
  const [event] = await db.insert(events).values(data).returning();
  return event;
}

// Update event
export async function updateEvent(
  id: string,
  data: Partial<NewEvent>
): Promise<Event> {
  const [event] = await db
    .update(events)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(events.id, id))
    .returning();
  return event;
}

// Increment claim count
export async function incrementEventClaims(pokemon: string): Promise<void> {
  await db
    .update(events)
    .set({
      totalClaims: sql`${events.totalClaims} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(events.pokemon, pokemon));
}
```

### 3. Database Connection (`index.ts`)
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as profilesSchema from './profilesSchema';
import * as eventsSchema from './eventsSchema';
// ... import all schemas

const connectionString = process.env.DATABASE_URL!;

// Optimized connection pool for Supabase
export const client = postgres(connectionString, {
  prepare: false,        // Required for PgBouncer
  ssl: 'require',
  max: 3,               // Minimal pool size
  idle_timeout: 20,     // Close idle connections
  connect_timeout: 30,  // Connection timeout
  max_lifetime: 60 * 30, // Recycle connections after 30min
});

// Initialize Drizzle with all schemas
export const db = drizzle(client, {
  schema: {
    ...profilesSchema,
    ...eventsSchema,
    // ... all schemas
  },
});

// Health check function
export async function getDbPing() {
  try {
    const result = await db.execute('SELECT 1 as test');
    return { ok: true, result };
  } catch (error) {
    return { ok: false, error };
  }
}
```

## Schema Patterns & Best Practices

### 1. Primary Keys
✅ **Use UUIDs for distributed systems**
```typescript
id: uuid('id').defaultRandom().primaryKey(),
```

✅ **Auto-increment for ordered data**
```typescript
id: serial('id').primaryKey(),
```

### 2. Timestamps
Always include created/updated timestamps:
```typescript
createdAt: timestamp('created_at').defaultNow().notNull(),
updatedAt: timestamp('updated_at').defaultNow().notNull(),
```

Update timestamp in queries:
```typescript
.set({ ...data, updatedAt: new Date() })
```

### 3. Foreign Keys
```typescript
export const eventClaims = pgTable('event_claims', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
});
```

### 4. Indexes
```typescript
export const posts = pgTable('posts', {
  // ... columns
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  createdAtIdx: index('created_at_idx').on(table.createdAt),
  // Composite index for common query patterns
  userCreatedIdx: index('user_created_idx').on(
    table.userId, 
    table.createdAt
  ),
}));
```

### 5. Unique Constraints
```typescript
pokemon: text('pokemon').notNull().unique(),

// Or composite unique
}, (table) => ({
  uniqueUserEvent: unique().on(table.userId, table.eventId),
}));
```

## Relations

### Define Relations (`relations.ts`)
```typescript
import { relations } from 'drizzle-orm';
import { profiles } from './profilesSchema';
import { posts, comments } from './socialSchema';

// One-to-many: Profile -> Posts
export const profilesRelations = relations(profiles, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
}));

// Many-to-one: Post -> Profile
export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(profiles, {
    fields: [posts.userId],
    references: [profiles.id],
  }),
  comments: many(comments),
}));

// Many-to-one: Comment -> Post and Profile
export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(profiles, {
    fields: [comments.userId],
    references: [profiles.id],
  }),
}));
```

### Query with Relations
```typescript
// Get post with author and comments
const postWithRelations = await db.query.posts.findFirst({
  where: eq(posts.id, postId),
  with: {
    author: true,
    comments: {
      with: {
        author: true,
      },
    },
  },
});
```

## Advanced Query Patterns

### 1. Complex Filtering
```typescript
import { and, or, eq, like, gt, isNull } from 'drizzle-orm';

const posts = await db
  .select()
  .from(posts)
  .where(
    and(
      eq(posts.published, true),
      or(
        like(posts.title, '%pokemon%'),
        like(posts.content, '%pokemon%')
      ),
      gt(posts.createdAt, new Date('2024-01-01')),
      isNull(posts.deletedAt)
    )
  );
```

### 2. Joins
```typescript
const postsWithAuthors = await db
  .select({
    post: posts,
    author: profiles,
  })
  .from(posts)
  .innerJoin(profiles, eq(posts.userId, profiles.id));
```

### 3. Aggregations
```typescript
import { count, sum, avg } from 'drizzle-orm';

const stats = await db
  .select({
    totalPosts: count(posts.id),
    totalLikes: sum(posts.likes),
    avgLikes: avg(posts.likes),
  })
  .from(posts)
  .where(eq(posts.userId, userId));
```

### 4. Pagination
```typescript
export async function getPaginatedPosts(
  page: number = 1,
  limit: number = 20
) {
  const offset = (page - 1) * limit;
  
  const posts = await db
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
  
  const [{ count }] = await db
    .select({ count: count() })
    .from(posts);
  
  return {
    posts,
    total: count,
    page,
    pages: Math.ceil(count / limit),
  };
}
```

### 5. Transactions
```typescript
export async function createPostWithHashtags(
  postData: NewPost,
  hashtags: string[]
) {
  return await db.transaction(async (tx) => {
    // Insert post
    const [post] = await tx
      .insert(posts)
      .values(postData)
      .returning();
    
    // Insert hashtags
    for (const tag of hashtags) {
      const [hashtag] = await tx
        .insert(hashtagsTable)
        .values({ name: tag })
        .onConflictDoNothing()
        .returning();
      
      // Link hashtag to post
      await tx.insert(postHashtags).values({
        postId: post.id,
        hashtagId: hashtag.id,
      });
    }
    
    return post;
  });
}
```

## Migrations

### Generate Migration
```bash
npm run db:generate
```

This creates a migration file in `drizzle/` based on schema changes.

### Apply Migration
```bash
npm run db:migrate
```

### Pull Schema from Database
```bash
npm run db:pull
```

Useful for syncing with Supabase if changes were made through UI.

## Connection Pool Configuration

### Optimized for Supabase
```typescript
const client = postgres(connectionString, {
  prepare: false,        // REQUIRED for PgBouncer
  ssl: 'require',        // REQUIRED for Supabase
  max: 3,               // Small pool (Supabase has connection limits)
  idle_timeout: 20,     // Close idle after 20s
  connect_timeout: 30,  // 30s connection timeout
  max_lifetime: 1800,   // Recycle after 30min
});
```

### Why These Settings?
- **prepare: false** - PgBouncer (Supabase's pooler) doesn't support prepared statements
- **max: 3** - Small pool to avoid exhausting Supabase connection limit
- **idle_timeout: 20** - Aggressively close idle connections
- **max_lifetime: 1800** - Prevent stale connections

## Type Safety

### From Schema to Application
```typescript
// 1. Define schema
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  username: text('username').notNull(),
  // ...
});

// 2. Infer types
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

// 3. Use in application
function UserCard({ profile }: { profile: Profile }) {
  // TypeScript knows all Profile properties
  return <Text>{profile.username}</Text>;
}

// 4. Type-safe queries
const profile: Profile = await db.query.profiles.findFirst({
  where: eq(profiles.id, userId),
});
```

### Validation with Zod
```typescript
// Create Zod schema from Drizzle schema
export const insertProfileSchema = createInsertSchema(profiles);

// Extend with custom validation
export const profileValidation = insertProfileSchema.extend({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  dateOfBirth: z.coerce.date(),
});

// Use for validation
export async function createProfile(data: unknown) {
  // Throws if invalid
  const validData = profileValidation.parse(data);
  
  return db.insert(profiles).values(validData).returning();
}
```

## Performance Optimization

### 1. Select Only What You Need
```typescript
// ❌ Bad - Selects all columns
const posts = await db.select().from(posts);

// ✅ Good - Select specific columns
const posts = await db
  .select({
    id: posts.id,
    title: posts.title,
    createdAt: posts.createdAt,
  })
  .from(posts);
```

### 2. Use Indexes
```typescript
// Index frequently queried columns
export const posts = pgTable('posts', {
  // ... columns
}, (table) => ({
  userIdIdx: index().on(table.userId),
  createdAtIdx: index().on(table.createdAt),
}));
```

### 3. Batch Operations
```typescript
// ❌ Bad - Multiple queries
for (const item of items) {
  await db.insert(table).values(item);
}

// ✅ Good - Single batch insert
await db.insert(table).values(items);
```

### 4. Connection Pooling
Keep pool size small and recycle connections regularly.

## Security with Row Level Security (RLS)

Supabase allows database-level security policies:

```sql
-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own posts
CREATE POLICY "Users can update own posts"
  ON posts
  FOR UPDATE
  USING (auth.uid() = user_id);
```

Enable in Drizzle schema:
```typescript
export const profiles = pgTable('profiles', {
  // ... columns
}, (table) => ({
  // RLS is enabled via Supabase dashboard
  // But we can document it here
}));
```

## Backup & Recovery

### Automatic Backups
Supabase provides:
- **Daily automatic backups** (7-day retention on free tier)
- **Point-in-time recovery** (paid plans)
- **Manual snapshots** via dashboard

### Local Backup
```bash
# Backup to file
pg_dump $DATABASE_URL > backup.sql

# Restore from file
psql $DATABASE_URL < backup.sql
```

## Development Workflow

### 1. Make Schema Changes
```typescript
// Add new column to existing table
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  username: text('username').notNull(),
  bio: text('bio'), // NEW COLUMN
});
```

### 2. Generate Migration
```bash
npm run db:generate
```

### 3. Review Migration
Check `drizzle/0001_*.sql` file

### 4. Apply to Database
```bash
npm run db:migrate
```

### 5. Update Types
Types are automatically updated from schema!

## Common Patterns

### Soft Deletes
```typescript
export const posts = pgTable('posts', {
  // ... other columns
  deletedAt: timestamp('deleted_at'),
});

// Soft delete
export async function softDeletePost(id: string) {
  await db
    .update(posts)
    .set({ deletedAt: new Date() })
    .where(eq(posts.id, id));
}

// Query only non-deleted
export async function getActivePosts() {
  return db
    .select()
    .from(posts)
    .where(isNull(posts.deletedAt));
}
```

### Audit Trails
```typescript
export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  action: text('action').notNull(),
  tableName: text('table_name').notNull(),
  recordId: uuid('record_id').notNull(),
  oldData: jsonb('old_data'),
  newData: jsonb('new_data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### Polymorphic Associations
```typescript
// Likes can be on posts or comments
export const likes = pgTable('likes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  likeableType: text('likeable_type').notNull(), // 'post' | 'comment'
  likeableId: uuid('likeable_id').notNull(),
});
```

## Resources
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [postgres.js GitHub](https://github.com/porsager/postgres)
