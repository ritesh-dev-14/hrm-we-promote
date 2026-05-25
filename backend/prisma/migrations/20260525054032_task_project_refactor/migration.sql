/*
  Warnings:

  - You are about to drop the column `date` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Task` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Task_date_idx";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "date",
DROP COLUMN "title",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "projectName" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Task_startDate_idx" ON "Task"("startDate");

-- CreateIndex
CREATE INDEX "Task_endDate_idx" ON "Task"("endDate");
