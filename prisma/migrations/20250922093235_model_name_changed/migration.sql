/*
  Warnings:

  - You are about to drop the `assessments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "assessment_progress" DROP CONSTRAINT "assessment_progress_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "assessments" DROP CONSTRAINT "assessments_skillId_fkey";

-- DropTable
DROP TABLE "assessments";

-- CreateTable
CREATE TABLE "talent_assessments" (
    "id" TEXT NOT NULL,
    "skillId" TEXT,
    "question" TEXT NOT NULL,
    "alternatives" TEXT[],
    "answer" TEXT,
    "difficulty" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "talent_assessments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "talent_assessments" ADD CONSTRAINT "talent_assessments_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_progress" ADD CONSTRAINT "assessment_progress_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "talent_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
