-- AlterTable
ALTER TABLE "ShootSubTask" ADD COLUMN     "plannedDate" TIMESTAMP(3),
ADD COLUMN     "projectId" TEXT;

-- CreateIndex
CREATE INDEX "ShootSubTask_projectId_idx" ON "ShootSubTask"("projectId");

-- AddForeignKey
ALTER TABLE "ShootSubTask" ADD CONSTRAINT "ShootSubTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
