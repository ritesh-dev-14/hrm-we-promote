-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'COORDINATOR';

-- CreateTable
CREATE TABLE "CoordinatorAssignment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "assignedToId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completionDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "employeeNumber" TEXT NOT NULL,
    "employeeEmail" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "submittedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoordinatorAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoordinatorAssignment_createdById_idx" ON "CoordinatorAssignment"("createdById");

-- CreateIndex
CREATE INDEX "CoordinatorAssignment_assignedToId_idx" ON "CoordinatorAssignment"("assignedToId");

-- CreateIndex
CREATE INDEX "CoordinatorAssignment_status_idx" ON "CoordinatorAssignment"("status");

-- CreateIndex
CREATE INDEX "CoordinatorAssignment_assignedTime_idx" ON "CoordinatorAssignment"("assignedTime");

-- CreateIndex
CREATE UNIQUE INDEX "CoordinatorAssignment_taskId_assignedToId_key" ON "CoordinatorAssignment"("taskId", "assignedToId");

-- AddForeignKey
ALTER TABLE "CoordinatorAssignment" ADD CONSTRAINT "CoordinatorAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordinatorAssignment" ADD CONSTRAINT "CoordinatorAssignment_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordinatorAssignment" ADD CONSTRAINT "CoordinatorAssignment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
