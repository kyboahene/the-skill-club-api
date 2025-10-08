/*
  Warnings:

  - A unique constraint covering the columns `[invitationToken]` on the table `candidate_invitations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invitationToken` to the `candidate_invitations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "candidate_invitations" ADD COLUMN     "invitationToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "candidate_invitations_invitationToken_key" ON "candidate_invitations"("invitationToken");
