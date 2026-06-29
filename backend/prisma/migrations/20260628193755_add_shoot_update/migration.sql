-- AlterTable
ALTER TABLE "ShootSubTask" ADD COLUMN     "submissionLinks" TEXT[],
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "submittedById" TEXT,
ADD COLUMN     "unableToSubmitReason" TEXT;

-- CreateIndex
CREATE INDEX "ShootSubTask_submittedById_idx" ON "ShootSubTask"("submittedById");

-- AddForeignKey
ALTER TABLE "ShootSubTask" ADD CONSTRAINT "ShootSubTask_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
