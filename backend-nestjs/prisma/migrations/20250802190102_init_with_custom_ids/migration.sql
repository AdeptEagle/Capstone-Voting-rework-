-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPERADMIN', 'ADMIN');

-- CreateEnum
CREATE TYPE "BallotStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'ENDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "admins" (
    "id" VARCHAR(50) NOT NULL,
    "admin_username" VARCHAR(255) NOT NULL,
    "admin_email" VARCHAR(255),
    "password" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" VARCHAR(50) NOT NULL,
    "department_name" VARCHAR(255) NOT NULL,
    "department_description" TEXT,
    "createdBy" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" VARCHAR(50) NOT NULL,
    "course_name" VARCHAR(255) NOT NULL,
    "course_code" VARCHAR(50) NOT NULL,
    "course_description" TEXT,
    "departmentId" VARCHAR(50) NOT NULL,
    "createdBy" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" VARCHAR(50) NOT NULL,
    "position_title" VARCHAR(255) NOT NULL,
    "position_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "voteLimit" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" VARCHAR(50) NOT NULL,
    "candidate_name" VARCHAR(255) NOT NULL,
    "candidate_email" VARCHAR(255) NOT NULL,
    "candidate_student_id" VARCHAR(50) NOT NULL,
    "photo" VARCHAR(255),
    "manifesto" TEXT,
    "positionId" VARCHAR(50) NOT NULL,
    "departmentId" VARCHAR(50),
    "courseId" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "partyListId" VARCHAR(50),
    "party_list_name" VARCHAR(255),

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voters" (
    "id" VARCHAR(50) NOT NULL,
    "voter_name" VARCHAR(255) NOT NULL,
    "voter_email" VARCHAR(255) NOT NULL,
    "voter_student_id" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255),
    "departmentId" VARCHAR(50),
    "courseId" VARCHAR(50),
    "hasVoted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "voters_pkey" PRIMARY KEY ("id")
);

-- Elections table removed - using ballot system instead

-- CreateTable
CREATE TABLE "votes" (
    "id" VARCHAR(50) NOT NULL,
    "voterId" VARCHAR(50) NOT NULL,
    "candidateId" VARCHAR(50) NOT NULL,
    "positionId" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- Election positions table removed - using ballot system instead

-- Election candidates table removed - using ballot system instead

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" VARCHAR(50) NOT NULL,
    "reset_token_email" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "party_lists" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(7),
    "logo" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "party_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elections" (
    "id" VARCHAR(50) NOT NULL,
    "election_title" VARCHAR(255) NOT NULL,
    "election_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" VARCHAR(50) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'draft',

    CONSTRAINT "elections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_positions" (
    "id" VARCHAR(50) NOT NULL,
    "electionId" VARCHAR(50) NOT NULL,
    "positionId" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "election_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_candidates" (
    "id" VARCHAR(50) NOT NULL,
    "candidateId" VARCHAR(50) NOT NULL,
    "electionId" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "election_candidates_pkey" PRIMARY KEY ("id")
);

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
    "ballot_allow_abstain" BOOLEAN NOT NULL DEFAULT false,
    "ballot_created_by" VARCHAR(50) NOT NULL,
    "ballot_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ballot_updated_at" TIMESTAMP(3) NOT NULL,
    "ballot_deleted_at" TIMESTAMP(3),
    "ballot_is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ballots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_ballot_history" (
    "id" VARCHAR(50) NOT NULL,
    "user_ballot_history_user_id" VARCHAR(50) NOT NULL,
    "user_ballot_history_ballot_id" VARCHAR(50) NOT NULL,
    "user_ballot_history_voted_at" TIMESTAMP(3),
    "user_ballot_history_vote_count" INTEGER NOT NULL DEFAULT 0,
    "user_ballot_history_is_completed" BOOLEAN NOT NULL DEFAULT false,
    "user_ballot_history_last_accessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_ballot_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ballot_positions" (
    "id" VARCHAR(50) NOT NULL,
    "ballot_position_ballot_id" VARCHAR(50) NOT NULL,
    "ballot_position_position_id" VARCHAR(50) NOT NULL,
    "ballot_position_display_order" INTEGER NOT NULL DEFAULT 0,
    "ballot_position_is_required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ballot_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ballot_candidates" (
    "id" VARCHAR(50) NOT NULL,
    "ballot_candidate_ballot_id" VARCHAR(50) NOT NULL,
    "ballot_candidate_candidate_id" VARCHAR(50) NOT NULL,
    "ballot_candidate_position_id" VARCHAR(50) NOT NULL,
    "ballot_candidate_is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ballot_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ballot_results" (
    "id" VARCHAR(50) NOT NULL,
    "ballot_results_ballot_id" VARCHAR(50) NOT NULL,
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
    "ballot_result_details_ballot_id" VARCHAR(50) NOT NULL,
    "ballot_result_details_position_id" VARCHAR(50) NOT NULL,
    "ballot_result_details_candidate_id" VARCHAR(50) NOT NULL,
    "ballot_result_details_vote_count" INTEGER NOT NULL DEFAULT 0,
    "ballot_result_details_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ballot_result_details_rank" INTEGER NOT NULL DEFAULT 0,
    "ballot_result_details_last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ballot_result_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ballot_templates" (
    "id" VARCHAR(50) NOT NULL,
    "ballot_template_name" VARCHAR(255) NOT NULL,
    "ballot_template_description" TEXT,
    "ballot_template_data" JSONB NOT NULL,
    "ballot_template_is_public" BOOLEAN NOT NULL DEFAULT false,
    "ballot_template_created_by" VARCHAR(50) NOT NULL,
    "ballot_template_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ballot_template_updated_at" TIMESTAMP(3) NOT NULL,
    "ballot_template_deleted_at" TIMESTAMP(3),
    "ballot_template_is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ballot_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_login_logs" (
    "id" VARCHAR(50) NOT NULL,
    "admin_id" VARCHAR(50) NOT NULL,
    "login_time" TIMESTAMP(3) NOT NULL,
    "logout_time" TIMESTAMP(3),
    "duration" INTEGER,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "session_id" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_login_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_login_logs" (
    "id" VARCHAR(50) NOT NULL,
    "user_id" VARCHAR(50) NOT NULL,
    "login_time" TIMESTAMP(3) NOT NULL,
    "logout_time" TIMESTAMP(3),
    "duration" INTEGER,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "session_id" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_login_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_admin_username_key" ON "admins"("admin_username");

-- CreateIndex
CREATE UNIQUE INDEX "admins_admin_email_key" ON "admins"("admin_email");

-- CreateIndex
CREATE UNIQUE INDEX "courses_course_code_key" ON "courses"("course_code");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_candidate_student_id_key" ON "candidates"("candidate_student_id");

-- CreateIndex
CREATE UNIQUE INDEX "voters_voter_email_key" ON "voters"("voter_email");

-- CreateIndex
CREATE UNIQUE INDEX "voters_voter_student_id_key" ON "voters"("voter_student_id");

-- Election indexes removed - using ballot system instead

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "elections_electionId_positionId_key" ON "election_positions"("electionId", "positionId");

-- CreateIndex
CREATE UNIQUE INDEX "election_candidates_electionId_candidateId_key" ON "election_candidates"("electionId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "user_ballot_history_user_ballot_history_user_id_user_ballot_history_ballot_id_key" ON "user_ballot_history"("user_ballot_history_user_id", "user_ballot_history_ballot_id");

-- CreateIndex
CREATE UNIQUE INDEX "ballot_positions_ballot_position_ballot_id_ballot_position_position_id_key" ON "ballot_positions"("ballot_position_ballot_id", "ballot_position_position_id");

-- CreateIndex
CREATE UNIQUE INDEX "ballot_candidates_ballot_candidate_ballot_id_ballot_candidate_candidate_id_key" ON "ballot_candidates"("ballot_candidate_ballot_id", "ballot_candidate_candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "ballot_results_ballot_results_ballot_id_key" ON "ballot_results"("ballot_results_ballot_id");

-- CreateIndex
CREATE UNIQUE INDEX "ballot_result_details_ballot_result_details_ballot_id_ballot_result_details_position_id_ballot_result_details_candidate_id_key" ON "ballot_result_details"("ballot_result_details_ballot_id", "ballot_result_details_position_id", "ballot_result_details_candidate_id");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voters" ADD CONSTRAINT "voters_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voters" ADD CONSTRAINT "voters_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Elections foreign key removed - using ballot system instead

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "voters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Votes electionId foreign key removed - using ballot system instead

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elections" ADD CONSTRAINT "elections_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_positions" ADD CONSTRAINT "election_positions_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_positions" ADD CONSTRAINT "election_positions_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_candidates" ADD CONSTRAINT "election_candidates_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_candidates" ADD CONSTRAINT "election_candidates_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "ballot_candidates" ADD CONSTRAINT "ballot_candidates_ballot_candidate_position_id_fkey" FOREIGN KEY ("ballot_candidate_position_id") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ballot_results" ADD CONSTRAINT "ballot_results_ballot_results_ballot_id_fkey" FOREIGN KEY ("ballot_results_ballot_id") REFERENCES "ballots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ballot_result_details" ADD CONSTRAINT "ballot_result_details_ballot_result_details_ballot_id_fkey" FOREIGN KEY ("ballot_result_details_ballot_id") REFERENCES "ballots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ballot_result_details" ADD CONSTRAINT "ballot_result_details_ballot_result_details_position_id_fkey" FOREIGN KEY ("ballot_result_details_position_id") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ballot_result_details" ADD CONSTRAINT "ballot_result_details_ballot_result_details_candidate_id_fkey" FOREIGN KEY ("ballot_result_details_candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ballot_templates" ADD CONSTRAINT "ballot_templates_ballot_template_created_by_fkey" FOREIGN KEY ("ballot_template_created_by") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_login_logs" ADD CONSTRAINT "admin_login_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_login_logs" ADD CONSTRAINT "user_login_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "voters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
