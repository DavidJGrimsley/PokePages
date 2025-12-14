-- Rename table instead of drop/create to preserve data
ALTER TABLE "legends_za_tracker" RENAME TO "dex_tracker";
--> statement-breakpoint
-- Add new pokedex column (default 'lumiose' for existing data, then remove default)
ALTER TABLE "dex_tracker" ADD COLUMN "pokedex" varchar(50) NOT NULL DEFAULT 'lumiose';
--> statement-breakpoint
-- Remove default after backfilling existing data
ALTER TABLE "dex_tracker" ALTER COLUMN "pokedex" DROP DEFAULT;
--> statement-breakpoint
-- Drop old unique constraint
ALTER TABLE "dex_tracker" DROP CONSTRAINT IF EXISTS "legends_za_tracker_user_id_pokemon_id_key";
--> statement-breakpoint
-- Add new unique constraint with pokedex
ALTER TABLE "dex_tracker" ADD CONSTRAINT "dex_tracker_user_pokedex_pokemon_key" UNIQUE("user_id","pokedex","pokemon_id");
--> statement-breakpoint
-- Drop old index
DROP INDEX IF EXISTS "idx_legends_za_tracker_user_id";
--> statement-breakpoint
-- Create new index (composite on user_id + pokedex for efficient querying)
CREATE INDEX "idx_dex_tracker_user_pokedex" ON "dex_tracker" USING btree ("user_id","pokedex");
--> statement-breakpoint
-- Drop old foreign key
ALTER TABLE "dex_tracker" DROP CONSTRAINT IF EXISTS "legends_za_tracker_user_id_fkey";
--> statement-breakpoint
-- Add new foreign key with new name
ALTER TABLE "dex_tracker" ADD CONSTRAINT "dex_tracker_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can view their own legends za tracker data" ON "dex_tracker";
--> statement-breakpoint
DROP POLICY IF EXISTS "Users can insert their own legends za tracker data" ON "dex_tracker";
--> statement-breakpoint
DROP POLICY IF EXISTS "Users can update their own legends za tracker data" ON "dex_tracker";
--> statement-breakpoint
DROP POLICY IF EXISTS "Users can delete their own legends za tracker data" ON "dex_tracker";
--> statement-breakpoint
-- Recreate RLS policies with new names
CREATE POLICY "Users can view their own dex tracker data" ON "dex_tracker" AS PERMISSIVE FOR SELECT TO public USING (auth.uid() = user_id);
--> statement-breakpoint
CREATE POLICY "Users can insert their own dex tracker data" ON "dex_tracker" AS PERMISSIVE FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
--> statement-breakpoint
CREATE POLICY "Users can update their own dex tracker data" ON "dex_tracker" AS PERMISSIVE FOR UPDATE TO public USING (auth.uid() = user_id);
--> statement-breakpoint
CREATE POLICY "Users can delete their own dex tracker data" ON "dex_tracker" AS PERMISSIVE FOR DELETE TO public USING (auth.uid() = user_id);