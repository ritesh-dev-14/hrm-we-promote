/*
  Warnings:

  - You are about to drop the column `groupId` on the `TaskAssignment` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "TaskAssignment_groupId_idx";

-- AlterTable
ALTER TABLE "TaskAssignment" DROP COLUMN "groupId",
ADD COLUMN     "taskGroupId" TEXT;

-- AlterTable
ALTER TABLE "TaskItemAssignment" ADD COLUMN     "taskGroupId" TEXT;

-- CreateIndex
CREATE INDEX "TaskAssignment_taskGroupId_idx" ON "TaskAssignment"("taskGroupId");

-- CreateIndex
CREATE INDEX "TaskItemAssignment_taskGroupId_idx" ON "TaskItemAssignment"("taskGroupId");

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskGroupId_fkey" FOREIGN KEY ("taskGroupId") REFERENCES "TaskGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskItemAssignment" ADD CONSTRAINT "TaskItemAssignment_taskGroupId_fkey" FOREIGN KEY ("taskGroupId") REFERENCES "TaskGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
