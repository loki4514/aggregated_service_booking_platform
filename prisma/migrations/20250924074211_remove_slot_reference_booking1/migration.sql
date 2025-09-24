/*
  Warnings:

  - You are about to drop the column `date` on the `slots` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "slots_date_state_idx";

-- DropIndex
DROP INDEX "slots_professionalId_date_state_idx";

-- AlterTable
ALTER TABLE "slots" DROP COLUMN "date";

-- CreateIndex
CREATE INDEX "slots_professionalId_state_idx" ON "slots"("professionalId", "state");
