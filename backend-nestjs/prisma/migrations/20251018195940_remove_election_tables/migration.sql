-- DropTable
DROP TABLE IF EXISTS "election_candidates" CASCADE;

-- DropTable
DROP TABLE IF EXISTS "election_positions" CASCADE;

-- DropTable
DROP TABLE IF EXISTS "elections" CASCADE;

-- Remove electionId column from votes table
ALTER TABLE "votes" DROP COLUMN IF EXISTS "electionId";

-- Remove electionId column from audit_logs table
ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "electionId";
