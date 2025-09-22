/*
  Warnings:

  - You are about to drop the column `antiCheatSettings` on the `company_assessments` table. All the data in the column will be lost.
  - You are about to drop the column `brandingSettings` on the `company_assessments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "company_assessments" DROP COLUMN "antiCheatSettings",
DROP COLUMN "brandingSettings";

-- CreateTable
CREATE TABLE "branding_settings" (
    "id" TEXT NOT NULL,
    "companyAssessmentId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "themeColorHex" TEXT,
    "fontFamily" TEXT,
    "welcomeText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branding_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anti_cheat_settings" (
    "id" TEXT NOT NULL,
    "companyAssessmentId" TEXT NOT NULL,
    "blockCopyPaste" BOOLEAN NOT NULL DEFAULT false,
    "disableRightClick" BOOLEAN NOT NULL DEFAULT false,
    "detectWindowFocus" BOOLEAN NOT NULL DEFAULT false,
    "detectTabSwitching" BOOLEAN NOT NULL DEFAULT false,
    "enableFullscreen" BOOLEAN NOT NULL DEFAULT false,
    "preventScreenCapture" BOOLEAN NOT NULL DEFAULT false,
    "enableScreenRecording" BOOLEAN NOT NULL DEFAULT false,
    "screenRecordingInterval" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anti_cheat_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "branding_settings_companyAssessmentId_key" ON "branding_settings"("companyAssessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "anti_cheat_settings_companyAssessmentId_key" ON "anti_cheat_settings"("companyAssessmentId");

-- AddForeignKey
ALTER TABLE "branding_settings" ADD CONSTRAINT "branding_settings_companyAssessmentId_fkey" FOREIGN KEY ("companyAssessmentId") REFERENCES "company_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anti_cheat_settings" ADD CONSTRAINT "anti_cheat_settings_companyAssessmentId_fkey" FOREIGN KEY ("companyAssessmentId") REFERENCES "company_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
