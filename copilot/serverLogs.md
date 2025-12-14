PS F:\ReactNativeApps\PokePages\api-server> npm start

> pokepages-api-server@1.0.0 start
> node api-server.js

[dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  write to custom object with { processEnv: myObject }
[DEBUG] dexTrackerQueries.ts loaded
[DEBUG] dexTracker/controller.ts loaded
[DEBUG] dexTracker/index.ts router loaded
📡 Startup diagnostics - Node: v22.20.0 PID: 62536
🔐 DATABASE_URL: SET len=125
🔐 SUPABASE_URL: SET len=40
💾 .env file found: true
🚀 PokePages Drizzle API server running on port 3001
📊 Health check: http://localhost:3001/test
📊 DB Connection Health check: http://localhost:3001/test-db
🎮 API endpoints:
   Events: http://localhost:3001/events
   AI: http://localhost:3001/ai
   Profiles: http://localhost:3001/profiles
   Dex Tracker: http://localhost:3001/dex-tracker?pokedex=lumiose
   Social: http://localhost:3001/social
   Favorites: http://localhost:3001/favorites
   Event Claims: http://localhost:3001/event-claims
dexTrackerRouter router loaded: function
socialRouter router loaded: function
[DEBUG] favorites router: GET /favorites/
[DEBUG] dex-tracker router: GET /dex-tracker?pokedex=lumiose
[DEBUG] dex-tracker router: GET /dex-tracker?pokedex=hyperspace
[favoritesQueries] getUserFavorites error: DrizzleQueryError: Failed query: select "id", "user_id", "feature_key", "feature_title", "created_at" from "favorite_features" where "favorite_features"."user_id" = $1
params: 4e6e7857-d6c1-4f2e-b608-091aa807a1ee
    at PostgresJsPreparedQuery.queryWithCache (file:///F:/ReactNativeApps/PokePages/node_modules/drizzle-orm/pg-core/session.js:41:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async file:///F:/ReactNativeApps/PokePages/node_modules/drizzle-orm/postgres-js/session.js:37:20
    at async Module.getUserFavorites (file:///F:/ReactNativeApps/PokePages/api-server/src/db/favoritesQueries.js:35:22)
    at async getFavorites (file:///F:/ReactNativeApps/PokePages/api-server/src/routes/favorites/controller.js:7:22) {
  query: 'select "id", "user_id", "feature_key", "feature_title", "created_at" from "favorite_features" where "favorite_features"."user_id" = $1',
  params: [ '4e6e7857-d6c1-4f2e-b608-091aa807a1ee' ],
  cause: Error: write CONNECT_TIMEOUT aws-0-us-east-1.pooler.supabase.com:6543
      at connectTimedOut (file:///F:/ReactNativeApps/PokePages/node_modules/postgres/src/connection.js:257:20)
      at Timeout.done [as _onTimeout] (file:///F:/ReactNativeApps/PokePages/node_modules/postgres/src/connection.js:1039:8)
      at listOnTimeout (node:internal/timers:590:11)
      at process.processTimers (node:internal/timers:523:7) {
    code: 'CONNECT_TIMEOUT',
    errno: 'CONNECT_TIMEOUT',
    address: 'aws-0-us-east-1.pooler.supabase.com',
    port: 6543
  }
}
Get favorites error: DrizzleQueryError: Failed query: select "id", "user_id", "feature_key", "feature_title", "created_at" from "favorite_features" where "favorite_features"."user_id" = $1
params: 4e6e7857-d6c1-4f2e-b608-091aa807a1ee
    at PostgresJsPreparedQuery.queryWithCache (file:///F:/ReactNativeApps/PokePages/node_modules/drizzle-orm/pg-core/session.js:41:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async file:///F:/ReactNativeApps/PokePages/node_modules/drizzle-orm/postgres-js/session.js:37:20
    at async Module.getUserFavorites (file:///F:/ReactNativeApps/PokePages/api-server/src/db/favoritesQueries.js:35:22)
    at async getFavorites (file:///F:/ReactNativeApps/PokePages/api-server/src/routes/favorites/controller.js:7:22) {
  query: 'select "id", "user_id", "feature_key", "feature_title", "created_at" from "favorite_features" where "favorite_features"."user_id" = $1',
  params: [ '4e6e7857-d6c1-4f2e-b608-091aa807a1ee' ],
  cause: Error: write CONNECT_TIMEOUT aws-0-us-east-1.pooler.supabase.com:6543
      at connectTimedOut (file:///F:/ReactNativeApps/PokePages/node_modules/postgres/src/connection.js:257:20)
      at Timeout.done [as _onTimeout] (file:///F:/ReactNativeApps/PokePages/node_modules/postgres/src/connection.js:1039:8)
      at listOnTimeout (node:internal/timers:590:11)
      at process.processTimers (node:internal/timers:523:7) {
    code: 'CONNECT_TIMEOUT',
    errno: 'CONNECT_TIMEOUT',
    address: 'aws-0-us-east-1.pooler.supabase.com',
    port: 6543
  }
}
Error fetching user Pokemon tracker data: DrizzleQueryError: Failed query: select "id", "user_id", "pokedex", "pokemon_id", "normal", "shiny", "alpha", "alpha_shiny", "created_at", "updated_at" from "dex_tracker" where ("dex_tracker"."user_id" = $1 and "dex_tracker"."pokedex" = $2)
params: 4e6e7857-d6c1-4f2e-b608-091aa807a1ee,lumiose
    at PostgresJsPreparedQuery.queryWithCache (file:///F:/ReactNativeApps/PokePages/node_modules/drizzle-orm/pg-core/session.js:41:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async file:///F:/ReactNativeApps/PokePages/node_modules/drizzle-orm/postgres-js/session.js:37:20
    at async getUserPokemonTrackerData (file:///F:/ReactNativeApps/PokePages/api-server/src/db/dexTrackerQueries.js:7:24)
    at async getUserTrackerData (file:///F:/ReactNativeApps/PokePages/api-server/src/routes/dexTracker/controller.js:19:22) {
  query: 'select "id", "user_id", "pokedex", "pokemon_id", "normal", "shiny", "alpha", "alpha_shiny", "created_at", "updated_at" from "dex_tracker" where ("dex_tracker"."user_id" = $1 and "dex_tracker"."pokedex" = $2)',
  params: [ '4e6e7857-d6c1-4f2e-b608-091aa807a1ee', 'lumiose' ],
  cause: Error: write CONNECT_TIMEOUT aws-0-us-east-1.pooler.supabase.com:6543
      at connectTimedOut (file:///F:/ReactNativeApps/PokePages/node_modules/postgres/src/connection.js:257:20)
      at Timeout.done [as _onTimeout] (file:///F:/ReactNativeApps/PokePages/node_modules/postgres/src/connection.js:1039:8)
      at listOnTimeout (node:internal/timers:590:11)
      at process.processTimers (node:internal/timers:523:7) {
    code: 'CONNECT_TIMEOUT',
    errno: 'CONNECT_TIMEOUT',
    address: 'aws-0-us-east-1.pooler.supabase.com',
    port: 6543
  }
}
Error getting user tracker data: DrizzleQueryError: Failed query: select "id", "user_id", "pokedex", "pokemon_id", "normal", "shiny", "alpha", "alpha_shiny", "created_at", "updated_at" from "dex_tracker" where ("dex_tracker"."user_id" = $1 and "dex_tracker"."pokedex" = $2)
params: 4e6e7857-d6c1-4f2e-b608-091aa807a1ee,lumiose
    at PostgresJsPreparedQuery.queryWithCache (file:///F:/ReactNativeApps/PokePages/node_modules/drizzle-orm/pg-core/session.js:41:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async file:///F:/ReactNativeApps/PokePages/node_modules/drizzle-orm/postgres-js/session.js:37:20
    at async getUserPokemonTrackerData (file:///F:/ReactNativeApps/PokePages/api-server/src/db/dexTrackerQueries.js:7:24)
    at async getUserTrackerData (file:///F:/ReactNativeApps/PokePages/api-server/src/routes/dexTracker/controller.js:19:22) {
  query: 'select "id", "user_id", "pokedex", "pokemon_id", "normal", "shiny", "alpha", "alpha_shiny", "created_at", "updated_at" from "dex_tracker" where ("dex_tracker"."user_id" = $1 and "dex_tracker"."pokedex" = $2)',
  params: [ '4e6e7857-d6c1-4f2e-b608-091aa807a1ee', 'lumiose' ],
  cause: Error: write CONNECT_TIMEOUT aws-0-us-east-1.pooler.supabase.com:6543
      at connectTimedOut (file:///F:/ReactNativeApps/PokePages/node_modules/postgres/src/connection.js:257:20)
      at Timeout.done [as _onTimeout] (file:///F:/ReactNativeApps/PokePages/node_modules/postgres/src/connection.js:1039:8)
      at listOnTimeout (node:internal/timers:590:11)
      at process.processTimers (node:internal/timers:523:7) {
    code: 'CONNECT_TIMEOUT',
    errno: 'CONNECT_TIMEOUT',
    address: 'aws-0-us-east-1.pooler.supabase.com',
    port: 6543
  }
}
Error fetching user Pokemon tracker data: DrizzleQueryError: Failed query: select "id", "user_id", "pokedex", "pokemon_id", "normal", "shiny", "alpha", "alpha_shiny", "created_at", "updated_at" from "dex_tracker" where ("dex_tracker"."user_id" = $1 and "dex_tracker"."pokedex" = $2)
params: 4e6e7857-d6c1-4f2e-b608-091aa807a1ee,hyperspace
    at PostgresJsPreparedQuery.queryWithCache (file:///F:/ReactNativeApps/PokePages/node_modules/drizzle-orm/pg-core/session.js:41:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async file:///F:/ReactNativeApps/PokePages/node_modules/drizzle-orm/postgres-js/session.js:37:20
    at async getUserPokemonTrackerData (file:///F:/ReactNativeApps/PokePages/api-server/src/db/dexTrackerQueries.js:7:24)
    at async getUserTrackerData (file:///F:/ReactNativeApps/PokePages/api-server/src/routes/dexTracker/controller.js:19:22) {
  query: 'select "id", "user_id", "pokedex", "pokemon_id", "normal", "shiny", "alpha", "alpha_shiny", "created_at", "updated_at" from "dex_tracker" where ("dex_tracker"."user_id" = $1 and "dex_tracker"."pokedex" = $2)',
  params: [ '4e6e7857-d6c1-4f2e-b608-091aa807a1ee', 'hyperspace' ],
  cause: Error: write CONNECT_TIMEOUT aws-0-us-east-1.pooler.supabase.com:6543
      at connectTimedOut (file:///F:/ReactNativeApps/PokePages/node_modules/postgres/src/connection.js:257:20)
      at Timeout.done [as _onTimeout] (file:///F:/ReactNativeApps/PokePages/node_modules/postgres/src/connection.js:1039:8)
      at listOnTimeout (node:internal/timers:590:11)
      at process.processTimers (node:internal/timers:523:7) {
    code: 'CONNECT_TIMEOUT',
    errno: 'CONNECT_TIMEOUT',
    address: 'aws-0-us-east-1.pooler.supabase.com',
    port: 6543
  }
}
Error getting user tracker data: DrizzleQueryError: Failed query: select "id", "user_id", "pokedex", "pokemon_id", "normal", "shiny", "alpha", "alpha_shiny", "created_at", "updated_at" from "dex_tracker" where ("dex_tracker"."user_id" = $1 and "dex_tracker"."pokedex" = $2)
params: 4e6e7857-d6c1-4f2e-b608-091aa807a1ee,hyperspace
    at PostgresJsPreparedQuery.queryWithCache (file:///F:/ReactNativeApps/PokePages/node_modules/drizzle-orm/pg-core/session.js:41:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async file:///F:/ReactNativeApps/PokePages/node_modules/drizzle-orm/postgres-js/session.js:37:20
    at async getUserPokemonTrackerData (file:///F:/ReactNativeApps/PokePages/api-server/src/db/dexTrackerQueries.js:7:24)
    at async getUserTrackerData (file:///F:/ReactNativeApps/PokePages/api-server/src/routes/dexTracker/controller.js:19:22) {
  query: 'select "id", "user_id", "pokedex", "pokemon_id", "normal", "shiny", "alpha", "alpha_shiny", "created_at", "updated_at" from "dex_tracker" where ("dex_tracker"."user_id" = $1 and "dex_tracker"."pokedex" = $2)',
  params: [ '4e6e7857-d6c1-4f2e-b608-091aa807a1ee', 'hyperspace' ],
  cause: Error: write CONNECT_TIMEOUT aws-0-us-east-1.pooler.supabase.com:6543
      at connectTimedOut (file:///F:/ReactNativeApps/PokePages/node_modules/postgres/src/connection.js:257:20)
      at Timeout.done [as _onTimeout] (file:///F:/ReactNativeApps/PokePages/node_modules/postgres/src/connection.js:1039:8)
      at listOnTimeout (node:internal/timers:590:11)
      at process.processTimers (node:internal/timers:523:7) {
    code: 'CONNECT_TIMEOUT',
    errno: 'CONNECT_TIMEOUT',
    address: 'aws-0-us-east-1.pooler.supabase.com',
    port: 6543
  }
}