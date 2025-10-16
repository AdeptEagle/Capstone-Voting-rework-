-- Check if ballots table exists and add election_id column if it doesn't exist
DO $$
BEGIN
    -- Check if ballots table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ballots') THEN
        -- Check if election_id column already exists
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'ballots' AND column_name = 'election_id') THEN
            -- Add the election_id column
            ALTER TABLE "ballots" ADD COLUMN "election_id" VARCHAR(50);
        END IF;
        
        -- Check if foreign key constraint already exists
        IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'ballots_election_id_fkey') THEN
            -- Add the foreign key constraint
            ALTER TABLE "ballots" ADD CONSTRAINT "ballots_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;
