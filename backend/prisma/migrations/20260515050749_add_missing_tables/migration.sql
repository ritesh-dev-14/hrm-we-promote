/*
  Warnings:

  - You are about to drop the column `level1Sent` on the `TaskEscalation` table. All the data in the column will be lost.
  - You are about to drop the column `level2Sent` on the `TaskEscalation` table. All the data in the column will be lost.
  - You are about to drop the column `level3Sent` on the `TaskEscalation` table. All the data in the column will be lost.
  - You are about to drop the column `level4Sent` on the `TaskEscalation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[employeeId,date,type]` on the table `TaskEscalation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `workDate` to the `TaskAssignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeId` to the `TaskEscalation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EscalationStatus" AS ENUM ('PENDING', 'MANAGER_NOTIFIED', 'HR_ESCALATED', 'ADMIN_ESCALATED', 'FINAL_ESCALATED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "EscalationType" AS ENUM ('NEXT_DAY_MISSING', 'FUTURE_4_DAYS_MISSING');

-- DropIndex
DROP INDEX "TaskEscalation_managerId_date_key";

-- AlterTable
ALTER TABLE "TaskAssignment" ADD COLUMN     "workDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
UPDATE "TaskAssignment" SET "workDate" = CURRENT_TIMESTAMP WHERE "workDate" IS NULL;
ALTER TABLE "TaskAssignment" ALTER COLUMN "workDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "TaskEscalation" DROP COLUMN "level1Sent",
DROP COLUMN "level2Sent",
DROP COLUMN "level3Sent",
DROP COLUMN "level4Sent",
ADD COLUMN     "adminEscalatedAt" TIMESTAMP(3),
ADD COLUMN     "adminMailSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "employeeId" TEXT,
ADD COLUMN     "finalEscalatedAt" TIMESTAMP(3),
ADD COLUMN     "hrEscalatedAt" TIMESTAMP(3),
ADD COLUMN     "hrMailSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "managerMailSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "popupSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminder1SentAt" TIMESTAMP(3),
ADD COLUMN     "reminder2SentAt" TIMESTAMP(3),
ADD COLUMN     "reminder3SentAt" TIMESTAMP(3),
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "status" "EscalationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "type" "EscalationType" NOT NULL DEFAULT 'NEXT_DAY_MISSING';

-- CreateTable
CREATE TABLE "EmployeeTaskCoverage" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "taskCount" INTEGER NOT NULL DEFAULT 0,
    "checkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeTaskCoverage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmployeeTaskCoverage_managerId_idx" ON "EmployeeTaskCoverage"("managerId");

-- CreateIndex
CREATE INDEX "EmployeeTaskCoverage_date_idx" ON "EmployeeTaskCoverage"("date");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeTaskCoverage_employeeId_date_key" ON "EmployeeTaskCoverage"("employeeId", "date");

-- CreateIndex
CREATE INDEX "TaskAssignment_workDate_idx" ON "TaskAssignment"("workDate");

-- CreateIndex
CREATE INDEX "TaskAssignment_userId_workDate_idx" ON "TaskAssignment"("userId", "workDate");

-- CreateIndex
CREATE INDEX "TaskEscalation_managerId_idx" ON "TaskEscalation"("managerId");

-- CreateIndex
CREATE INDEX "TaskEscalation_status_idx" ON "TaskEscalation"("status");

-- CreateIndex
CREATE INDEX "TaskEscalation_date_idx" ON "TaskEscalation"("date");

-- CreateIndex
CREATE UNIQUE INDEX "TaskEscalation_employeeId_date_type_key" ON "TaskEscalation"("employeeId", "date", "type");

-- AddForeignKey
ALTER TABLE "TaskEscalation" ADD CONSTRAINT "TaskEscalation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeTaskCoverage" ADD CONSTRAINT "EmployeeTaskCoverage_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeTaskCoverage" ADD CONSTRAINT "EmployeeTaskCoverage_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
