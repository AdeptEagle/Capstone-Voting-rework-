/*
  Migration: Rename Business Logic Fields to Table-Specific Names
  Date: 2025-08-26
  Purpose: Rename generic fields to be table-specific while preserving all data
*/

-- Rename Admin table fields
ALTER TABLE "admins" RENAME COLUMN "username" TO "admin_username";
ALTER TABLE "admins" RENAME COLUMN "email" TO "admin_email";

-- Rename Department table fields
ALTER TABLE "departments" RENAME COLUMN "name" TO "department_name";
ALTER TABLE "departments" RENAME COLUMN "description" TO "department_description";

-- Rename Course table fields
ALTER TABLE "courses" RENAME COLUMN "name" TO "course_name";
ALTER TABLE "courses" RENAME COLUMN "code" TO "course_code";
ALTER TABLE "courses" RENAME COLUMN "description" TO "course_description";

-- Rename Position table fields
ALTER TABLE "positions" RENAME COLUMN "title" TO "position_title";
ALTER TABLE "positions" RENAME COLUMN "description" TO "position_description";

-- Rename Candidate table fields
ALTER TABLE "candidates" RENAME COLUMN "name" TO "candidate_name";
ALTER TABLE "candidates" RENAME COLUMN "email" TO "candidate_email";
ALTER TABLE "candidates" RENAME COLUMN "studentId" TO "candidate_student_id";

-- Rename Voter table fields
ALTER TABLE "voters" RENAME COLUMN "name" TO "voter_name";
ALTER TABLE "voters" RENAME COLUMN "email" TO "voter_email";
ALTER TABLE "voters" RENAME COLUMN "studentId" TO "voter_student_id";

-- Rename Election table fields
ALTER TABLE "elections" RENAME COLUMN "title" TO "election_title";
ALTER TABLE "elections" RENAME COLUMN "description" TO "election_description";

-- Rename PasswordResetToken table fields
ALTER TABLE "password_reset_tokens" RENAME COLUMN "email" TO "reset_token_email";

-- Update unique constraints to use new column names
DROP INDEX IF EXISTS "admins_username_key";
DROP INDEX IF EXISTS "admins_email_key";
DROP INDEX IF EXISTS "candidates_studentId_key";
DROP INDEX IF EXISTS "courses_code_key";
DROP INDEX IF EXISTS "voters_studentId_key";
DROP INDEX IF EXISTS "voters_email_key";
DROP INDEX IF EXISTS "password_reset_tokens_email_key";

-- Create new unique constraints with new column names
CREATE UNIQUE INDEX "admins_admin_username_key" ON "admins"("admin_username");
CREATE UNIQUE INDEX "admins_admin_email_key" ON "admins"("admin_email");
CREATE UNIQUE INDEX "candidates_candidate_student_id_key" ON "candidates"("candidate_student_id");
CREATE UNIQUE INDEX "courses_course_code_key" ON "courses"("course_code");
CREATE UNIQUE INDEX "voters_voter_student_id_key" ON "voters"("voter_student_id");
CREATE UNIQUE INDEX "voters_voter_email_key" ON "voters"("voter_email");
CREATE UNIQUE INDEX "password_reset_tokens_reset_token_email_key" ON "password_reset_tokens"("reset_token_email");
