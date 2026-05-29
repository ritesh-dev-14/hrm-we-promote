-- CreateEnum
CREATE TYPE "FollowUpMessageType" AS ENUM ('INITIAL', 'FOLLOW_UP', 'REPLY');

-- CreateTable
CREATE TABLE "CoordinatorFollowUp" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "messageType" "FollowUpMessageType" NOT NULL DEFAULT 'FOLLOW_UP',
    "senderRole" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoordinatorFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoordinatorFollowUp_assignmentId_idx" ON "CoordinatorFollowUp"("assignmentId");

-- CreateIndex
CREATE INDEX "CoordinatorFollowUp_senderId_idx" ON "CoordinatorFollowUp"("senderId");

-- AddForeignKey
ALTER TABLE "CoordinatorFollowUp" ADD CONSTRAINT "CoordinatorFollowUp_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "CoordinatorAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordinatorFollowUp" ADD CONSTRAINT "CoordinatorFollowUp_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
