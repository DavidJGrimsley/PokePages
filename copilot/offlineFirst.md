What “offline-first” really means (and why it matters)

Offline-first apps treat the local device (or browser) database as the primary source of truth — reads and writes happen locally first instead of relying on immediate server communication. 
Expo Documentation
+1

When online, the app syncs changes (writes, updates, deletions) with the server (or remote backend). This means the app remains usable even with poor or no network — improving UX, resiliency, and responsiveness. 
Expo Documentation
+2
Canadian Software Agency Inc.
+2

For a unified codebase serving both mobile (iOS/Android) and web (PWA or web build), that approach makes a lot of sense: data should be accessible in both contexts, sync across devices, and degrade gracefully when offline. 
Relevant Software
+1

Because of these benefits, many libraries and architectures lean toward "local-first + sync" rather than "always online." 
Expo Documentation
+1

🛠 Key technical building blocks

These are the main pieces you’ll need — or should consider — when building offline-first with Expo + React Native + Web.

Function / responsibility	Typical solution or tool (mobile + web)
Local storage / database	For simple data: key-value (settings, tokens) → e.g. @react-native-async-storage/async-storage. 
Coding Easy Peasy
+1

For structured data / complex queries: SQLite (via Expo), or databases like WatermelonDB, Realm, or similar. 
Canadian Software Agency Inc.
+2
Syndell Technologies
+2

Network status detection	Use a connectivity monitoring library — e.g. @react-native-community/netinfo — so the app knows when it's offline vs online. 
Canadian Software Agency Inc.
+2
MoldStud
+2

Sync / queue system — for writes done offline to send when online	Maintain a local queue of actions/changes made offline. When connectivity returns, replay / sync queued writes to server. 
Relevant Software
+2
iFlair Web Technologies
+2

For mobile (Expo) you can use background-task or background-fetch APIs to periodically attempt sync. 
Canadian Software Agency Inc.
+1

Conflict detection & resolution (if multiple devices or concurrent edits possible)	Use versioning or timestamp-based metadata. On sync, detect conflicts and decide a strategy (e.g. “last write wins” or merge). Many offline-first guides suggest tracking metadata fields such as lastModifiedAt, isDirty, version. 
Canadian Software Agency Inc.
+2
Coding Easy Peasy
+2

State management + persistence	Use state libraries that can persist data locally across sessions — e.g. Redux Persist, or a reactive database like WatermelonDB which loads data only when needed. 
iFlair Web Technologies
+1

(For web build) Offline / PWA caching & storage	Use browser-compatible storage: e.g. IndexedDB (via libraries like PouchDB) or caching strategies so data/asset retrieval works when no network. For PWAs, background sync / service-worker-based sync helps mirror native-mobile offline patterns. 
codekeel.com
+2
MoldStud
+2
🎯 Best Practices & Architectural Guidelines

Here are more high-level, strategic guidelines — especially useful when starting a new project with offline-first in mind.

Design for offline from day one
Don’t treat offline support as a “later feature.” From the outset: define which data must be accessible offline (user data, content, preferences…), and design your data models accordingly. 
Canadian Software Agency Inc.
+1

Also design your UI/UX with offline scenarios in mind (e.g. show offline status, grey out features that require server). 
Coding Easy Peasy
+1

Use a layered storage approach
For simple config or small data, key-value storage is fine. But for structured data (lists, objects, relationships) use a local database (SQLite, Realm, WatermelonDB, etc.). 
Canadian Software Agency Inc.
+1

This layered strategy helps optimize performance and storage usage while preserving flexibility.

Queue offline writes + use background sync
When user performs actions offline (form submissions, updates, creating items, etc.), store them in a queue. When connectivity returns, flush that queue by syncing to server. 
Relevant Software
+2
iFlair Web Technologies
+2

On mobile (with Expo), use background-fetch / background-tasks so sync can happen even if the app was closed. 
Canadian Software Agency Inc.
+1

Use optimistic UI + local updates for instant feedback
As soon as user performs an action (e.g. adds a record), update the local storage/state and UI immediately (optimistic update). Then sync to server in background. This keeps the app responsive even offline. 
Expo Documentation
+2
MoldStud
+2

Conflict resolution strategy
If multiple devices or web + mobile clients can edit same data, when syncing, you must detect conflicts. Common methods: timestamp-based “last-write-wins.” Once that works, you can consider more robust merge logic if needed. 
Canadian Software Agency Inc.
+2
iFlair Web Technologies
+2

Make sure to store metadata (e.g. lastModified, isDirty) in your data model so conflict resolution is easier. 
Canadian Software Agency Inc.
+1

Provide clear offline UI/UX & feedback
Let users know when they are offline and when the app is syncing. E.g. show offline banner, sync status, maybe a “sync now” button. 
iFlair Web Technologies
+1

Handle failed sync gracefully: retry, queue failures, alert the user if needed, ensure data isn’t lost. 
Canadian Software Agency Inc.
+1

Minimize data transfer & sync only “deltas”
When syncing, avoid sending all data. Instead, only sync changes — i.e. what’s new, changed, or deleted since last sync. This reduces bandwidth, improves performance, and avoids redundant writes. 
Relevant Software
+2
Syndell Technologies
+2

Also implement pagination / lazy loading for large datasets, to avoid loading everything at once unnecessarily. 
Canadian Software Agency Inc.
+1

Test thoroughly under offline / flaky network conditions
Simulate offline mode, network flapping (going on/off), slow networks, background/foreground transitions — especially on mobile — to ensure sync logic, queueing, conflict resolution, UI feedback works correctly. 
Canadian Software Agency Inc.
+2
MoldStud
+2

⚠️ Pitfalls & Things to Watch Out For (especially when supporting both web and mobile)

Some storage or sync libraries work better on mobile than web — or vice versa. For example, a library built with SQLite may run fine on mobile but might not have a straightforward web equivalent. That means you need a careful abstraction layer. 
Canadian Software Agency Inc.
+2
Syndell Technologies
+2

If using web + mobile, you might need separate implementations under the hood: e.g. local database (SQLite) on mobile, but IndexedDB (or similar) on web. That means you need a unified “data access layer” abstraction so your UI/business logic doesn’t care where data comes from.

Sync conflicts — without proper versioning or conflict resolution, you risk data loss or inconsistent state when multiple clients (web + mobile) update data offline.

Background sync is harder on web: service workers and background-sync APIs may work differently across browsers, and may not always be reliable (especially on mobile browsers).

🔧 Recommendations / What I’d Do If I Were You (with Your Background)

Given that you already use JS/TS (since you work with Unreal + UE-for-Fortnite, C++, but likely comfortable with structured thinking) — and that you may want to support multiple platforms — here’s a recommended stack/approach for a new offline-first app:

Use Expo + React Native for cross-platform mobile + web.

Abstract your data access layer behind a repository/service API.

On mobile: use SQLite (via Expo) or a database like WatermelonDB (if relational data, querying) or Realm (if support available).

On web: use IndexedDB (via a wrapper like PouchDB) or any other local-storage + sync-capable solution.

For state management: use something like Redux (or lighter alternative) + Redux Persist, or use a reactive database store (WatermelonDB).

For offline write & sync: implement a queue of “pending actions.” When network returns (detect via NetInfo or equivalent), run sync logic. On mobile, consider using background-fetch or background-tasks so sync can happen even if app is closed.

Include UI indicators: show offline mode, show sync progress, maybe a “sync now” button.

Add metadata fields (e.g. lastModified, isDirty) to your data models to support conflict resolution.

For sync algorithm: simplest is “last write wins.” Once that works, you can consider more complex merge logic if needed.

What’s “new(er)” in Expo-compatible storage
expo-storage

The npm package “expo-storage” is listed as of November 2025. According to its npm entry, it aims to give a “simple and efficient solution for persistent data storage in Expo / React Native applications,” presumably to overcome some limitations of older storage libraries. 
npm

That suggests it’s meant for newer-ish projects, and could be a replacement or alternative to older libraries — especially if you want something that “just works” with the current Expo ecosystem.

expo-storage-universal

Another newer package is “expo-storage-universal,” which provides a “universal storage implementation for Expo that works across all platforms” (i.e. mobile native + web). 
npm
+1

It offers a consistent API, type-safe wrappers for different data types, etc. This is especially useful if you want a unified interface for both mobile and web under one codebase. 
npm

Combined with Other Modern Solutions: State + Persistence + Sync — e.g. TinyBase + expo‑sqlite

According to the official Expo “local-first” guidance, if you need more than key-value storage (e.g. structured or relational data, offline-first logic, syncing), pairing a reactive store like TinyBase with a persistence layer (like expo-sqlite on native, or browser storage on web) is a modern “blessed pattern.” 
Expo Documentation
+2
Expo Documentation
+2

This means you can treat your app’s data as first-class state (with reactive updates, queries, relations, etc.), while still persisting it across app sessions — and have something that works across mobile and web. 
Expo Documentation
+2
tinybase.org
+2

⚠️ Why there’s no “one true” localStorage library in Expo — and what to pick depending on your needs

Legacy / older storage (e.g. @react-native-async-storage/async-storage): This has been the de facto key-value storage for a long time, and is documented by Expo. 
Expo Documentation
+1

Limitations: AsyncStorage is great for small amounts of simple data (settings, tokens, small caches), but it’s not ideal for large datasets, relational data, or complex offline-first syncing needs. 
Expo Documentation
+1

Modern / future-oriented approach: If you want to build a “local-first” app — with syncing, offline capability, possibly structured and relational data — combining a reactive state store (like TinyBase) with a more robust persistence layer (SQLite on native, localStorage/IndexedDB on web) tends to be the recommended modern path. 
Expo Documentation
+2
Expo Documentation
+2

Unified API for all platforms: If you just need key-value storage that works both on mobile (native) and web, “expo-storage-universal” aims to give a consistent API across platforms, which makes it convenient for code reuse. 
npm
+1

🎯 My Recommendation (Given What You Build, Mr DJ)

Since you want a codebase that works both for web and mobile, and likely want more than just trivial key-value — I’d lean toward:

Use expo-storage-universal (for simple persistent key-value needs) or expo-storage for basic storage needs — especially if you may not need complex data structures.

If your data is more complex (lists, relationships, frequent updates, offline + sync logic), consider TinyBase + expo-sqlite (on native) + fallbacks to web storage for web builds — as per the "local-first" architecture recommended by Expo.

---

## ✅ Conflict Resolution Strategy for PokePages

Based on the `favoriteFeaturesStore` implementation, we use **optimistic updates with server validation**:

1. **Local-first writes**: Update local storage immediately when user takes action (instant UI feedback)
2. **Background sync**: Send change to server immediately if online
3. **Rollback on failure**: If server rejects the change, revert local state to previous value
4. **Server wins on conflicts**: On app startup or reconnection, fetch server state and overwrite local cache
5. **No queue for failures**: Failed syncs are retried immediately on next action, not queued

This pattern works well for user preferences and claim tracking where:
- Changes are infrequent
- Server is authoritative source of truth
- Users expect to see their changes immediately
- Conflicts are rare (user unlikely to claim same event on two devices simultaneously)

For event claims specifically:
- Local AsyncStorage/localStorage is primary for reads (fast, offline-capable)
- All writes update local immediately + sync to Supabase
- On init/foreground, fetch server claims and merge (server wins)
- If claim timestamp on server is newer, use server value