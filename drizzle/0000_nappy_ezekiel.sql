-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "user_event_participation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"event_id" uuid,
	"contribution_count" bigint DEFAULT 0,
	"last_contributed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_event_participation_user_id_event_id_key" UNIQUE("user_id","event_id")
);
--> statement-breakpoint
ALTER TABLE "user_event_participation" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "anonymous_event_participation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid,
	"anonymous_id" text NOT NULL,
	"contribution_count" bigint DEFAULT 0,
	"last_contributed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "anonymous_event_participation_event_id_anonymous_id_key" UNIQUE("event_id","anonymous_id")
);
--> statement-breakpoint
ALTER TABLE "anonymous_event_participation" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "event_counters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_key" text NOT NULL,
	"pokemon_name" text NOT NULL,
	"pokemon_id" integer,
	"total_count" bigint DEFAULT 0,
	"target_count" bigint DEFAULT 0,
	"max_rewards" bigint DEFAULT 0,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"distribution_start" text,
	"distribution_end" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "event_counters_event_key_key" UNIQUE("event_key")
);
--> statement-breakpoint
ALTER TABLE "event_counters" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" text,
	"birthdate" date,
	"avatar_url" text,
	"bio" text,
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "profiles_username_key" UNIQUE("username"),
	CONSTRAINT "username_length" CHECK ((username IS NULL) OR (char_length(username) >= 3))
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_event_participation" ADD CONSTRAINT "user_event_participation_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event_counters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_event_participation" ADD CONSTRAINT "user_event_participation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anonymous_event_participation" ADD CONSTRAINT "anonymous_event_participation_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event_counters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_event_participation_user_id" ON "user_event_participation" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE POLICY "Enable read access for all users" ON "user_event_participation" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "user_participation_upsert_own" ON "user_event_participation" AS PERMISSIVE FOR ALL TO public;--> statement-breakpoint
CREATE POLICY "anon_participation_insert_all" ON "anonymous_event_participation" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "anon_participation_select_all" ON "anonymous_event_participation" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "anon_participation_update_all" ON "anonymous_event_participation" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "event_counters_select_all" ON "event_counters" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Public profiles are viewable by everyone." ON "profiles" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Users can insert their own profile." ON "profiles" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Users can update own profile." ON "profiles" AS PERMISSIVE FOR UPDATE TO public;
*/