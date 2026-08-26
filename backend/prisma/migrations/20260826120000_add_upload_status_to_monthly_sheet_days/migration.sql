-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "ProjectMonthlySheetDay"
ADD COLUMN "uploadStatus" "UploadStatus" NOT NULL DEFAULT 'PENDING';