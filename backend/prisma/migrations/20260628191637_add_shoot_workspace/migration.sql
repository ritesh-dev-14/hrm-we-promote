-- CreateEnum
CREATE TYPE "ShootSubTaskType" AS ENUM ('PIC', 'REEL');

-- CreateEnum
CREATE TYPE "VideoType" AS ENUM ('HORIZONTAL', 'VERTICAL');

-- CreateTable
CREATE TABLE "ShootWorkspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShootWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShootWorkspaceMember" (
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShootWorkspaceMember_pkey" PRIMARY KEY ("workspaceId","userId")
);

-- CreateTable
CREATE TABLE "ShootTask" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "noOfPics" INTEGER NOT NULL DEFAULT 0,
    "noOfReels" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShootTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShootSubTask" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ShootSubTaskType" NOT NULL,
    "referenceLinks" TEXT[],
    "videoType" "VideoType" NOT NULL,
    "setupType" "SetupType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShootSubTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShootWorkspace_createdById_idx" ON "ShootWorkspace"("createdById");

-- CreateIndex
CREATE INDEX "ShootWorkspaceMember_userId_idx" ON "ShootWorkspaceMember"("userId");

-- CreateIndex
CREATE INDEX "ShootTask_workspaceId_idx" ON "ShootTask"("workspaceId");

-- CreateIndex
CREATE INDEX "ShootTask_createdById_idx" ON "ShootTask"("createdById");

-- CreateIndex
CREATE INDEX "ShootSubTask_taskId_idx" ON "ShootSubTask"("taskId");

-- AddForeignKey
ALTER TABLE "ShootWorkspace" ADD CONSTRAINT "ShootWorkspace_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShootWorkspaceMember" ADD CONSTRAINT "ShootWorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ShootWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShootWorkspaceMember" ADD CONSTRAINT "ShootWorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShootTask" ADD CONSTRAINT "ShootTask_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ShootWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShootTask" ADD CONSTRAINT "ShootTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShootSubTask" ADD CONSTRAINT "ShootSubTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ShootTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
