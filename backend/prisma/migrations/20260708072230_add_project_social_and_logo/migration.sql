-- CreateEnum
CREATE TYPE "ShootSubTaskStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'UNABLE_TO_SUBMIT');

-- AlterTable
ALTER TABLE "ProjectMonthlySheetDay" ADD COLUMN     "referenceLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "title" TEXT,
ADD COLUMN     "videoType" "VideoType",
ALTER COLUMN "reelType" DROP NOT NULL,
ALTER COLUMN "postType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ShootSubTask" ADD COLUMN     "reviewReason" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT,
ADD COLUMN     "status" "ShootSubTaskStatus" NOT NULL DEFAULT 'DRAFT',
ALTER COLUMN "submissionLinks" SET DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "ShootSubTask_reviewedById_idx" ON "ShootSubTask"("reviewedById");

-- AddForeignKey
ALTER TABLE "ShootSubTask" ADD CONSTRAINT "ShootSubTask_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
