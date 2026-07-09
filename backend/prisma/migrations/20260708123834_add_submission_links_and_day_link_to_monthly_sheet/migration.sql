-- AlterTable
ALTER TABLE "ProjectMonthlySheetDay" ADD COLUMN     "submissionLinks" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "ShootSubTask" ADD COLUMN     "dayId" TEXT;

-- CreateIndex
CREATE INDEX "ShootSubTask_dayId_idx" ON "ShootSubTask"("dayId");

-- AddForeignKey
ALTER TABLE "ShootSubTask" ADD CONSTRAINT "ShootSubTask_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "ProjectMonthlySheetDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;
