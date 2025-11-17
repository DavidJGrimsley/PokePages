CREATE TABLE "favorite_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"feature_key" text NOT NULL,
	"feature_title" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorite_features_unique_pair" UNIQUE("user_id","feature_key")
);
--> statement-breakpoint
ALTER TABLE "favorite_features" ADD CONSTRAINT "favorite_features_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "favorite_features_user_idx" ON "favorite_features" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "favorite_features_key_idx" ON "favorite_features" USING btree ("feature_key");