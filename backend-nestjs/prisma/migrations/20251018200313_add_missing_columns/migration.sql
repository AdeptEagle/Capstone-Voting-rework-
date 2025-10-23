-- Add missing party_list_id column to candidates table
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "party_list_id" VARCHAR(50);

-- Drop existing constraint if it exists, then add foreign key constraint for party_list_id
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'candidates_party_list_id_fkey' 
               AND table_name = 'candidates' 
               AND table_schema = 'public') THEN
        ALTER TABLE "candidates" DROP CONSTRAINT "candidates_party_list_id_fkey";
    END IF;
END $$;

ALTER TABLE "candidates" ADD CONSTRAINT "candidates_party_list_id_fkey" 
FOREIGN KEY ("party_list_id") REFERENCES "party_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE;
