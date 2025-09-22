/*
  Warnings:

  - You are about to drop the column `testIds` on the `company_assessments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "company_assessments" DROP COLUMN "testIds";

-- AlterTable
ALTER TABLE "tests" ADD COLUMN     "companyId" TEXT;

-- CreateTable
CREATE TABLE "_AssessmentTests" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AssessmentTests_AB_unique" ON "_AssessmentTests"("A", "B");

-- CreateIndex
CREATE INDEX "_AssessmentTests_B_index" ON "_AssessmentTests"("B");

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssessmentTests" ADD CONSTRAINT "_AssessmentTests_A_fkey" FOREIGN KEY ("A") REFERENCES "company_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssessmentTests" ADD CONSTRAINT "_AssessmentTests_B_fkey" FOREIGN KEY ("B") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
