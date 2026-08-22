-- CreateTable
CREATE TABLE "SeoTask" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "workingOnTask" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "screenshotUrl" TEXT NOT NULL,
    "screenshotPublicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SeoTask_projectId_idx" ON "SeoTask"("projectId");
CREATE INDEX "SeoTask_managerId_idx" ON "SeoTask"("managerId");
CREATE INDEX "SeoTask_createdAt_idx" ON "SeoTask"("createdAt");

-- AddForeignKey
ALTER TABLE "SeoTask" ADD CONSTRAINT "SeoTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SeoTask" ADD CONSTRAINT "SeoTask_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON UPDATE CASCADE;
