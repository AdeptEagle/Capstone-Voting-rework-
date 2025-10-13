-- AlterTable
ALTER TABLE "ballots" ADD COLUMN "election_id" VARCHAR(50);

-- AddForeignKey
ALTER TABLE "ballots" ADD CONSTRAINT "ballots_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
