-- CreateTable
CREATE TABLE "ShootTaskAssignment" (
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShootTaskAssignment_pkey" PRIMARY KEY ("taskId", "userId")
);

-- CreateIndex
CREATE INDEX "ShootTaskAssignment_userId_idx" ON "ShootTaskAssignment"("userId");

-- AddForeignKey
ALTER TABLE "ShootTaskAssignment" ADD CONSTRAINT "ShootTaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ShootTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShootTaskAssignment" ADD CONSTRAINT "ShootTaskAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;