-- Create user_event_claims table
CREATE TABLE IF NOT EXISTS "user_event_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_key" text NOT NULL,
	"claimed" boolean DEFAULT false NOT NULL,
	"claimed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_event_claims_user_id_event_key_key" UNIQUE("user_id","event_key")
);

-- Add foreign key constraint
ALTER TABLE "user_event_claims" ADD CONSTRAINT "user_event_claims_user_id_profiles_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "user_event_claims_user_id_idx" ON "user_event_claims"("user_id");
CREATE INDEX IF NOT EXISTS "user_event_claims_event_key_idx" ON "user_event_claims"("event_key");
CREATE INDEX IF NOT EXISTS "user_event_claims_claimed_at_idx" ON "user_event_claims"("claimed_at");

-- Enable Row Level Security
ALTER TABLE "user_event_claims" ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own event claims
CREATE POLICY "Users can view own event claims"
ON "user_event_claims"
FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own event claims
CREATE POLICY "Users can insert own event claims"
ON "user_event_claims"
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own event claims
CREATE POLICY "Users can update own event claims"
ON "user_event_claims"
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own event claims
CREATE POLICY "Users can delete own event claims"
ON "user_event_claims"
FOR DELETE
USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_event_claims_updated_at ON "user_event_claims";
CREATE TRIGGER update_user_event_claims_updated_at
    BEFORE UPDATE ON "user_event_claims"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
