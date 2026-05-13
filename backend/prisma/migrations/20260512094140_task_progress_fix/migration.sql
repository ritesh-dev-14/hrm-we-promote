/*
  Warnings:

  - The values [PENDING] on the enum `AssignmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING] on the enum `TaskItemStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AssignmentStatus_new" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'COMPLETED');
ALTER TABLE "TaskAssignment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "TaskItemAssignment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "TaskAssignment" ALTER COLUMN "status" TYPE "AssignmentStatus_new" USING ("status"::text::"AssignmentStatus_new");
ALTER TABLE "TaskItemAssignment" ALTER COLUMN "status" TYPE "AssignmentStatus_new" USING ("status"::text::"AssignmentStatus_new");
ALTER TYPE "AssignmentStatus" RENAME TO "AssignmentStatus_old";
ALTER TYPE "AssignmentStatus_new" RENAME TO "AssignmentStatus";
DROP TYPE "AssignmentStatus_old";
ALTER TABLE "TaskAssignment" ALTER COLUMN "status" SET DEFAULT 'ASSIGNED';
ALTER TABLE "TaskItemAssignment" ALTER COLUMN "status" SET DEFAULT 'ASSIGNED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TaskItemStatus_new" AS ENUM ('DRAFT', 'ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'COMPLETED');
ALTER TABLE "TaskItem" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "TaskItem" ALTER COLUMN "status" TYPE "TaskItemStatus_new" USING ("status"::text::"TaskItemStatus_new");
ALTER TYPE "TaskItemStatus" RENAME TO "TaskItemStatus_old";
ALTER TYPE "TaskItemStatus_new" RENAME TO "TaskItemStatus";
DROP TYPE "TaskItemStatus_old";
ALTER TABLE "TaskItem" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TaskStatus_new" AS ENUM ('DRAFT', 'ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'COMPLETED', 'OVERDUE', 'CANCELLED');
ALTER TABLE "Task" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "TaskStatus_old";
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "TaskAssignment" ALTER COLUMN "status" SET DEFAULT 'ASSIGNED';

-- AlterTable
ALTER TABLE "TaskItem" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "TaskItemAssignment" ALTER COLUMN "status" SET DEFAULT 'ASSIGNED';
