/*
  Warnings:

  - You are about to drop the column `month` on the `certificates` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `certificates` table. All the data in the column will be lost.
  - The `foundedDate` column on the `companies` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `fromDate` column on the `education` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `toDate` column on the `education` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `date` on the `interviews` table. All the data in the column will be lost.
  - The `minPay` column on the `jobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `maxPay` column on the `jobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `salary` column on the `jobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `year` column on the `personal_projects` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `fromDate` column on the `work_history` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `toDate` column on the `work_history` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId,assessmentId]` on the table `assessment_progress` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `talents` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `date` on the `events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `scheduledDate` to the `interviews` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `duration` on the `interviews` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `passStatus` to the `score_summaries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'APPLICATION_SUBMITTED';
ALTER TYPE "ActivityType" ADD VALUE 'INTERVIEW_SCHEDULED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Gender" ADD VALUE 'OTHER';
ALTER TYPE "Gender" ADD VALUE 'PREFER_NOT_TO_SAY';

-- AlterEnum
ALTER TYPE "InterviewStatus" ADD VALUE 'RESCHEDULED';

-- AlterEnum
ALTER TYPE "JobStatus" ADD VALUE 'DRAFT';

-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "permissions" JSONB;

-- AlterTable
ALTER TABLE "anti_cheat_violations" ADD COLUMN     "resolved" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "coverLetter" TEXT;

-- AlterTable
ALTER TABLE "assessments" ADD COLUMN     "difficulty" TEXT;

-- AlterTable
ALTER TABLE "certificates" DROP COLUMN "month",
DROP COLUMN "year",
ADD COLUMN     "credentialId" TEXT,
ADD COLUMN     "credentialUrl" TEXT,
ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "issueDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "foundedDate",
ADD COLUMN     "foundedDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "company_assessments" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "education" ADD COLUMN     "gpa" DOUBLE PRECISION,
DROP COLUMN "fromDate",
ADD COLUMN     "fromDate" TIMESTAMP(3),
DROP COLUMN "toDate",
ADD COLUMN     "toDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "email_templates" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "maxAttendees" INTEGER,
ALTER COLUMN "image" DROP NOT NULL,
ALTER COLUMN "link" DROP NOT NULL,
DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "interviews" DROP COLUMN "date",
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "interviewers" TEXT[],
ADD COLUMN     "scheduledDate" TIMESTAMP(3) NOT NULL,
DROP COLUMN "duration",
ADD COLUMN     "duration" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "job_skills" ADD COLUMN     "required" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "applicationDeadline" TIMESTAMP(3),
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "positionsAvailable" INTEGER,
ADD COLUMN     "remote" "Remote" NOT NULL DEFAULT 'ONSITE',
DROP COLUMN "minPay",
ADD COLUMN     "minPay" DECIMAL(65,30),
DROP COLUMN "maxPay",
ADD COLUMN     "maxPay" DECIMAL(65,30),
DROP COLUMN "salary",
ADD COLUMN     "salary" "Salary" NOT NULL DEFAULT 'YEARLY';

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "readAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "personal_projects" ADD COLUMN     "technologies" TEXT[],
ALTER COLUMN "projectLink" DROP NOT NULL,
DROP COLUMN "year",
ADD COLUMN     "year" INTEGER;

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "difficulty" TEXT;

-- AlterTable
ALTER TABLE "resources" ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "duration" INTEGER;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "score_summaries" ADD COLUMN     "passStatus" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "screen_recording_data" ADD COLUMN     "recordingUrl" TEXT;

-- AlterTable
ALTER TABLE "skills" ADD COLUMN     "category" TEXT,
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "talent_skills" ADD COLUMN     "level" TEXT;

-- AlterTable
ALTER TABLE "talents" ADD COLUMN     "city" TEXT;

-- AlterTable
ALTER TABLE "test_configs" ADD COLUMN     "timeLimit" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastLoginAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "work_history" DROP COLUMN "fromDate",
ADD COLUMN     "fromDate" TIMESTAMP(3),
DROP COLUMN "toDate",
ADD COLUMN     "toDate" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "assessment_progress_userId_assessmentId_key" ON "assessment_progress"("userId", "assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "talents_userId_key" ON "talents"("userId");

-- AddForeignKey
ALTER TABLE "company_users" ADD CONSTRAINT "company_users_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_progress" ADD CONSTRAINT "assessment_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_assessments" ADD CONSTRAINT "company_assessments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_invitations" ADD CONSTRAINT "candidate_invitations_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_rankings" ADD CONSTRAINT "candidate_rankings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recent_activities" ADD CONSTRAINT "recent_activities_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
