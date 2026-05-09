-- CreateEnum
CREATE TYPE "TaskItemStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'VERIFIED');

-- CreateTable
CREATE TABLE "TaskItem" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "theme" TEXT,
    "referenceLink" TEXT,
    "instructions" TEXT,
    "order" INTEGER,
    "status" "TaskItemStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskItemAssignment" (
    "id" TEXT NOT NULL,
    "taskItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskItemAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskItemSubmission" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "driveLink" TEXT NOT NULL,
    "remarks" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedByManager" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TaskItemSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskItem_taskId_idx" ON "TaskItem"("taskId");

-- CreateIndex
CREATE INDEX "TaskItemAssignment_userId_idx" ON "TaskItemAssignment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskItemAssignment_taskItemId_userId_key" ON "TaskItemAssignment"("taskItemId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskItemSubmission_assignmentId_key" ON "TaskItemSubmission"("assignmentId");

-- AddForeignKey
ALTER TABLE "TaskItem" ADD CONSTRAINT "TaskItem_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskItemAssignment" ADD CONSTRAINT "TaskItemAssignment_taskItemId_fkey" FOREIGN KEY ("taskItemId") REFERENCES "TaskItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskItemAssignment" ADD CONSTRAINT "TaskItemAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskItemSubmission" ADD CONSTRAINT "TaskItemSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "TaskItemAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
