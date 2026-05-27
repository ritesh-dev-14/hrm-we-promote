/*
  Warnings:

  - The values [UNABLE_TO_SUBMIT] on the enum `AssignmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [UNABLE_TO_SUBMIT] on the enum `TaskItemStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `unableToSubmitReason` on the `TaskItemSubmission` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AssignmentStatus_new" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'COMPLETED', 'PENDING');
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
CREATE TYPE "TaskItemStatus_new" AS ENUM ('DRAFT', 'ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'COMPLETED', 'PENDING');
ALTER TABLE "TaskItem" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "TaskItem" ALTER COLUMN "status" TYPE "TaskItemStatus_new" USING ("status"::text::"TaskItemStatus_new");
ALTER TYPE "TaskItemStatus" RENAME TO "TaskItemStatus_old";
ALTER TYPE "TaskItemStatus_new" RENAME TO "TaskItemStatus";
DROP TYPE "TaskItemStatus_old";
ALTER TABLE "TaskItem" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "TaskItemSubmission" DROP COLUMN "unableToSubmitReason";
