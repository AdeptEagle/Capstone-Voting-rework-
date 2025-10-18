-- Add missing party_list_id column to candidates table
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "party_list_id" VARCHAR(50);

-- Add foreign key constraint for party_list_id
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_party_list_id_fkey" 
FOREIGN KEY ("party_list_id") REFERENCES "party_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE;
