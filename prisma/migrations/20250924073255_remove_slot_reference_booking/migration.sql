/*
  Warnings:

  - You are about to drop the column `slotId` on the `bookings` table. All the data in the column will be lost.
  - Added the required column `scheduledEndAt` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `slots` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_slotId_fkey";

-- DropIndex
DROP INDEX "bookings_slotId_key";

-- DropIndex
DROP INDEX "slots_professionalId_startAt_state_idx";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "slotId",
ADD COLUMN     "scheduledEndAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "slots" ADD COLUMN     "date" DATE NOT NULL;

-- CreateIndex
CREATE INDEX "slots_professionalId_date_state_idx" ON "slots"("professionalId", "date", "state");

-- CreateIndex
CREATE INDEX "slots_date_state_idx" ON "slots"("date", "state");
