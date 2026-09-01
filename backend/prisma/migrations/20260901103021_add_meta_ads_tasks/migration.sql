-- CreateEnum
CREATE TYPE "WhatsappMessageStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED');

-- DropForeignKey
ALTER TABLE "MetaAdsTask" DROP CONSTRAINT "MetaAdsTask_createdById_fkey";

-- DropForeignKey
ALTER TABLE "SeoTask" DROP CONSTRAINT "SeoTask_managerId_fkey";

-- AlterTable
ALTER TABLE "MarketingMonthlyReportRow" ALTER COLUMN "currentlyRunning" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ProjectDailyReport" ADD COLUMN     "blockers" TEXT,
ADD COLUMN     "lastDiscussion" TEXT,
ADD COLUMN     "lastWorking" TEXT,
ADD COLUMN     "nextStep" TEXT,
ADD COLUMN     "taskProgress" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "SeoReport" ADD COLUMN     "clientContactNumber" TEXT;

-- CreateTable
CREATE TABLE "WhatsappMessage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "templateId" TEXT,
    "clientPhoneNumber" TEXT NOT NULL,
    "messageContent" TEXT NOT NULL,
    "status" "WhatsappMessageStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "messageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsappTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentType" TEXT NOT NULL,
    "templateContent" TEXT NOT NULL,
    "variables" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WhatsappMessage_projectId_idx" ON "WhatsappMessage"("projectId");

-- CreateIndex
CREATE INDEX "WhatsappMessage_managerId_idx" ON "WhatsappMessage"("managerId");

-- CreateIndex
CREATE INDEX "WhatsappMessage_status_idx" ON "WhatsappMessage"("status");

-- CreateIndex
CREATE INDEX "WhatsappMessage_sentAt_idx" ON "WhatsappMessage"("sentAt");

-- CreateIndex
CREATE INDEX "WhatsappMessage_createdAt_idx" ON "WhatsappMessage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsappTemplate_name_key" ON "WhatsappTemplate"("name");

-- CreateIndex
CREATE INDEX "WhatsappTemplate_departmentType_idx" ON "WhatsappTemplate"("departmentType");

-- CreateIndex
CREATE INDEX "WhatsappTemplate_isActive_idx" ON "WhatsappTemplate"("isActive");

-- AddForeignKey
ALTER TABLE "MetaAdsTask" ADD CONSTRAINT "MetaAdsTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoTask" ADD CONSTRAINT "SeoTask_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsappMessage" ADD CONSTRAINT "WhatsappMessage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsappMessage" ADD CONSTRAINT "WhatsappMessage_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsappMessage" ADD CONSTRAINT "WhatsappMessage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WhatsappTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
