-- AlterEnum
ALTER TYPE "AssignmentStatus" ADD VALUE 'UNABLE_TO_SUBMIT';

-- AlterEnum
ALTER TYPE "TaskItemStatus" ADD VALUE 'UNABLE_TO_SUBMIT';

-- AlterTable
ALTER TABLE "TaskItemSubmission" ADD COLUMN     "unableToSubmitReason" TEXT;
