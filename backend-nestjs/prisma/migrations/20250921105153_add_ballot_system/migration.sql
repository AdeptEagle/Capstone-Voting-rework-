-- CreateEnum
CREATE TYPE "BallotStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'ENDED', 'CANCELLED');

-- AlterTable
ALTER TABLE "votes" ADD COLUMN     "ballotId" TEXT;

-- CreateTable
CREATE TABLE "ballots" (
    "id" VARCHAR(50) NOT NULL,
    "ballot_title" VARCHAR(255) NOT NULL,
    "ballot_description" TEXT,
    "ballot_start_date" TIMESTAMP(3) NOT NULL,
    "ballot_end_date" TIMESTAMP(3) NOT NULL,
    "ballot_status" "BallotStatus" NOT NULL DEFAULT 'DRAFT',
    "ballot_is_active" BOOLEAN NOT NULL DEFAULT false,
    "ballot_max_votes_per_user" INTEGER NOT NULL DEFAULT 1,
    "ballot_allow_multiple_votes" BOOLEAN NOT NULL DEFAULT false,
    "ballot_require_all_positions" BOOLEAN NOT NULL DEFAULT true,
    "ballot_show_results" BOOLEAN NOT NULL DEFAULT true,
    "ballot_show_results_after" TIMESTAMP(3),
    "ballot_show_live_results" BOOLEAN NOT NULL DEFAULT true,
    "ballot_created_by" TEXT NOT NULL,
    "ballot_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ballot_updated_at" TIMESTAMP(3) NOT NULL,
    "ballot_deleted_at" TIMESTAMP(3),
    "ballot_is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ballots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_ballot_history" (
    "id" VARCHAR(50) NOT NULL,
    "user_ballot_history_user_id" TEXT NOT NULL,
    "user_ballot_history_ballot_id" TEXT NOT NULL,
    "user_ballot_history_voted_at" TIMESTAMP(3),
    "user_ballot_history_vote_count" INTEGER NOT NULL DEFAULT 0,
    "user_ballot_history_is_completed" BOOLEAN NOT NULL DEFAULT false,
    "user_ballot_history_last_accessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_ballot_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ballot_positions" (
    "id" VARCHAR(50) NOT NULL,
    "ballot_position_ballot_id" TEXT NOT NULL,
    "ballot_position_position_id" TEXT NOT NULL,
    "ballot_position_display_order" INTEGER NOT NULL DEFAULT 0,
    "ballot_position_is_required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ballot_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ballot_candidates" (
    "id" VARCHAR(50) NOT NULL,
    "ballot_candidate_ballot_id" TEXT NOT NULL,
    "ballot_candidate_candidate_id" TEXT NOT NULL,
    "ballot_candidate_position_id" TEXT NOT NULL,
    "ballot_candidate_is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ballot_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ballot_results" (
    "id" VARCHAR(50) NOT NULL,
    "ballot_results_ballot_id" TEXT NOT NULL,
    "ballot_results_total_votes" INTEGER NOT NULL DEFAULT 0,
    "ballot_results_total_voters" INTEGER NOT NULL DEFAULT 0,
    "ballot_results_voter_turnout" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ballot_results_last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ballot_results_is_final" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ballot_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ballot_result_details" (
    "id" VARCHAR(50) NOT NULL,
    "ballot_result_details_ballot_id" TEXT NOT NULL,
    "ballot_result_details_position_id" TEXT NOT NULL,
    "ballot_result_details_candidate_id" TEXT NOT NULL,
    "ballot_result_details_vote_count" INTEGER NOT NULL DEFAULT 0,
    "ballot_result_details_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ballot_result_details_rank" INTEGER NOT NULL DEFAULT 0,
    "ballot_result_details_last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ballot_result_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_ballot_history_user_ballot_history_user_id_user_ballot_key" ON "user_ballot_history"("user_ballot_history_user_id", "user_ballot_history_ballot_id");

-- CreateIndex
CREATE UNIQUE INDEX "ballot_positions_ballot_position_ballot_id_ballot_position__key" ON "ballot_positions"("ballot_position_ballot_id", "ballot_position_position_id");

-- CreateIndex
CREATE UNIQUE INDEX "ballot_candidates_ballot_candidate_ballot_id_ballot_candida_key" ON "ballot_candidates"("ballot_candidate_ballot_id", "ballot_candidate_candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "ballot_results_ballot_results_ballot_id_key" ON "ballot_results"("ballot_results_ballot_id");

-- CreateIndex
CREATE UNIQUE INDEX "ballot_result_details_ballot_result_details_ballot_id_ballo_key" ON "ballot_result_details"("ballot_result_details_ballot_id", "ballot_result_details_position_id", "ballot_result_details_candidate_id");

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_ballotId_fkey" FOREIGN KEY ("ballotId") REFERENCES "ballots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ballots" ADD CONSTRAINT "ballots_ballot_created_by_fkey" FOREIGN KEY ("ballot_created_by") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_ballot_history" ADD CONSTRAINT "user_ballot_history_user_ballot_history_user_id_fkey" FOREIGN KEY ("user_ballot_history_user_id") REFERENCES "voters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_ballot_history" ADD CONSTRAINT "user_ballot_history_user_ballot_history_ballot_id_fkey" FOREIGN KEY ("user_ballot_history_ballot_id") REFERENCES "ballots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ballot_positions" ADD CONSTRAINT "ballot_positions_ballot_position_ballot_id_fkey" FOREIGN KEY ("ballot_position_ballot_id") REFERENCES "ballots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ballot_positions" ADD CONSTRAINT "ballot_positions_ballot_position_position_id_fkey" FOREIGN KEY ("ballot_position_position_id") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ballot_candidates" ADD CONSTRAINT "ballot_candidates_ballot_candidate_ballot_id_fkey" FOREIGN KEY ("ballot_candidate_ballot_id") REFERENCES "ballots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ballot_candidates" ADD CONSTRAINT "ballot_candidates_ballot_candidate_candidate_id_fkey" FOREIGN KEY ("ballot_candidate_candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ballot_candidates" ADD CONSTRAINT "ballot_candidates_ballot_candidate_ballot_id_ballot_candid_fkey" FOREIGN KEY ("ballot_candidate_ballot_id", "ballot_candidate_position_id") REFERENCES "ballot_positions"("ballot_position_ballot_id", "ballot_position_position_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ballot_results" ADD CONSTRAINT "ballot_results_ballot_results_ballot_id_fkey" FOREIGN KEY ("ballot_results_ballot_id") REFERENCES "ballots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ballot_result_details" ADD CONSTRAINT "ballot_result_details_ballot_fkey" FOREIGN KEY ("ballot_result_details_ballot_id") REFERENCES "ballots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ballot_result_details" ADD CONSTRAINT "ballot_result_details_ballot_results_fkey" FOREIGN KEY ("ballot_result_details_ballot_id") REFERENCES "ballot_results"("ballot_results_ballot_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ballot_result_details" ADD CONSTRAINT "ballot_result_details_position_fkey" FOREIGN KEY ("ballot_result_details_position_id") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ballot_result_details" ADD CONSTRAINT "ballot_result_details_candidate_fkey" FOREIGN KEY ("ballot_result_details_candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
