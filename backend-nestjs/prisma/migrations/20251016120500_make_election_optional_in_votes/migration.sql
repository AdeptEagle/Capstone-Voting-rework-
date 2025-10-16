-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_electionId_fkey";

-- AlterTable
ALTER TABLE "votes" ALTER COLUMN "electionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
