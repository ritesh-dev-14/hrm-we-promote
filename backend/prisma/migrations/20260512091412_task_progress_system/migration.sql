/*
  Warnings:

  - The values [ASSIGNED,APPROVED] on the enum `AssignmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ASSIGNED] on the enum `TaskItemStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ASSIGNED] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AssignmentStatus_new" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'COMPLETED');
ALTER TABLE "TaskAssignment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "TaskItemAssignment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "TaskAssignment" ALTER COLUMN "status" TYPE "AssignmentStatus_new" USING ("status"::text::"AssignmentStatus_new");
ALTER TABLE "TaskItemAssignment" ALTER COLUMN "status" TYPE "AssignmentStatus_new" USING ("status"::text::"AssignmentStatus_new");
ALTER TYPE "AssignmentStatus" RENAME TO "AssignmentStatus_old";
ALTER TYPE "AssignmentStatus_new" RENAME TO "AssignmentStatus";
DROP TYPE "AssignmentStatus_old";
ALTER TABLE "TaskAssignment" ALTER COLUMN "status" SET DEFAULT 'PENDING';
ALTER TABLE "TaskItemAssignment" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TaskItemStatus_new" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'COMPLETED');
ALTER TABLE "TaskItem" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "TaskItem" ALTER COLUMN "status" TYPE "TaskItemStatus_new" USING ("status"::text::"TaskItemStatus_new");
ALTER TYPE "TaskItemStatus" RENAME TO "TaskItemStatus_old";
ALTER TYPE "TaskItemStatus_new" RENAME TO "TaskItemStatus";
DROP TYPE "TaskItemStatus_old";
ALTER TABLE "TaskItem" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TaskStatus_new" AS ENUM ('DRAFT', 'PENDING', 'IN_PROGRESS', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'COMPLETED', 'OVERDUE', 'CANCELLED');
ALTER TABLE "Task" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "TaskStatus_old";
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TaskAssignment" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "TaskItem" ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TaskItemAssignment" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'PENDING';
