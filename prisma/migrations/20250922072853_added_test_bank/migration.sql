/*
  Warnings:

  - You are about to drop the column `assessmentId` on the `test_configs` table. All the data in the column will be lost.
  - You are about to drop the column `testId` on the `test_configs` table. All the data in the column will be lost.
  - You are about to drop the `_AssessmentTests` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[assessmentTestId]` on the table `test_configs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assessmentTestId` to the `test_configs` table without a default value. This is not possible if the table is not empty.
  - Made the column `companyId` on table `tests` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "_AssessmentTests" DROP CONSTRAINT "_AssessmentTests_A_fkey";

-- DropForeignKey
ALTER TABLE "_AssessmentTests" DROP CONSTRAINT "_AssessmentTests_B_fkey";

-- DropForeignKey
ALTER TABLE "test_configs" DROP CONSTRAINT "test_configs_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "test_configs" DROP CONSTRAINT "test_configs_testId_fkey";

-- DropIndex
DROP INDEX "test_configs_testId_assessmentId_key";

-- AlterTable
ALTER TABLE "test_configs" DROP COLUMN "assessmentId",
DROP COLUMN "testId",
ADD COLUMN     "assessmentTestId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tests" ALTER COLUMN "companyId" SET NOT NULL;

-- DropTable
DROP TABLE "_AssessmentTests";

-- CreateTable
CREATE TABLE "assessment_tests" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "order" INTEGER,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "weightage" DOUBLE PRECISION,
    "timeLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_tests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assessment_tests_assessmentId_testId_key" ON "assessment_tests"("assessmentId", "testId");

-- CreateIndex
CREATE UNIQUE INDEX "test_configs_assessmentTestId_key" ON "test_configs"("assessmentTestId");

-- AddForeignKey
ALTER TABLE "assessment_tests" ADD CONSTRAINT "assessment_tests_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "company_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_tests" ADD CONSTRAINT "assessment_tests_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_configs" ADD CONSTRAINT "test_configs_assessmentTestId_fkey" FOREIGN KEY ("assessmentTestId") REFERENCES "assessment_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
