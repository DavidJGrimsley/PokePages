CREATE TABLE "legends_za_tracker" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"pokemon_id" integer NOT NULL,
	"normal" boolean DEFAULT false NOT NULL,
	"shiny" boolean DEFAULT false NOT NULL,
	"alpha" boolean DEFAULT false NOT NULL,
	"alpha_shiny" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "legends_za_tracker_user_id_pokemon_id_key" UNIQUE("user_id","pokemon_id")
);
--> statement-breakpoint
ALTER TABLE "legends_za_tracker" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "legends_za_tracker" ADD CONSTRAINT "legends_za_tracker_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_legends_za_tracker_user_id" ON "legends_za_tracker" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE POLICY "Users can view their own legends za tracker data" ON "legends_za_tracker" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own legends za tracker data" ON "legends_za_tracker" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can update their own legends za tracker data" ON "legends_za_tracker" AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can delete their own legends za tracker data" ON "legends_za_tracker" AS PERMISSIVE FOR DELETE TO public USING ((auth.uid() = user_id));