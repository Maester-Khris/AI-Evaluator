/*
  Warnings:

  - A unique constraint covering the columns `[correlationId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "correlationId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "Message_correlationId_key" ON "Message"("correlationId");

-- CreateIndex
CREATE INDEX "Message_correlationId_idx" ON "Message"("correlationId");
