/*
  Warnings:

  - A unique constraint covering the columns `[slotId]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slotId` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SlotState" AS ENUM ('AVAILABLE', 'HELD', 'BOOKED', 'BLOCKED');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "slotId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "slots" (
    "id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "state" "SlotState" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "slots_professionalId_startAt_state_idx" ON "slots"("professionalId", "startAt", "state");

-- CreateIndex
CREATE UNIQUE INDEX "slots_professionalId_startAt_key" ON "slots"("professionalId", "startAt");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_slotId_key" ON "bookings"("slotId");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "professionals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
