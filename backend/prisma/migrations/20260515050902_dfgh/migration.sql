/*
  Warnings:

  - Made the column `employeeId` on table `TaskEscalation` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "TaskEscalation" DROP CONSTRAINT "TaskEscalation_employeeId_fkey";

-- AlterTable
ALTER TABLE "TaskAssignment" ALTER COLUMN "workDate" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TaskEscalation" ALTER COLUMN "employeeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "TaskEscalation" ADD CONSTRAINT "TaskEscalation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
