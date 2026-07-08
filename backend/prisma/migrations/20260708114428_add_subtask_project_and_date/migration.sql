-- AlterTable
ALTER TABLE "ProjectMonthlySheetDay" ADD COLUMN     "submissionLinks" TEXT[] DEFAULT ARRAY[]::TEXT[];
