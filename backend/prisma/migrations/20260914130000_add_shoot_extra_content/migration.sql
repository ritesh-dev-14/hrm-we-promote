-- AlterTable
ALTER TABLE "ShootWorkspace" ADD COLUMN "projectId" TEXT;

-- CreateTable
CREATE TABLE "ShootExtraContent" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "extraPics" INTEGER NOT NULL DEFAULT 0,
    "extraReels" INTEGER NOT NULL DEFAULT 0,
    "driveLink" TEXT NOT NULL,
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShootExtraContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShootWorkspace_projectId_idx" ON "ShootWorkspace"("projectId");
CREATE INDEX "ShootExtraContent_taskId_idx" ON "ShootExtraContent"("taskId");
CREATE INDEX "ShootExtraContent_submittedById_idx" ON "ShootExtraContent"("submittedById");

-- AddForeignKey
ALTER TABLE "ShootWorkspace" ADD CONSTRAINT "ShootWorkspace_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShootExtraContent" ADD CONSTRAINT "ShootExtraContent_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ShootTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShootExtraContent" ADD CONSTRAINT "ShootExtraContent_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;