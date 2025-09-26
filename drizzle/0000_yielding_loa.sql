ALTER TABLE "user_event_participation" DROP CONSTRAINT "user_event_participation_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_id_fkey";
--> statement-breakpoint
ALTER TABLE "user_event_participation" ADD CONSTRAINT "user_event_participation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;