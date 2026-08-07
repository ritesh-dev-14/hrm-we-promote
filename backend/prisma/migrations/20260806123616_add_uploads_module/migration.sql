-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ONGOING', 'SUBMITTED', 'VERIFIED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MediaSource" ADD VALUE 'SHOOT_REQUIRED';
ALTER TYPE "MediaSource" ADD VALUE 'AI_REQUIRED';
ALTER TYPE "MediaSource" ADD VALUE 'DATA_AVAILABLE';

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_createdById_fkey";

-- AlterTable
ALTER TABLE "CoordinatorAssignment" ADD COLUMN     "overdueAlertSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "LeaveBalance" ALTER COLUMN "casual" SET DEFAULT 6;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "clientEmail" TEXT,
ADD COLUMN     "clientEmailPassword" TEXT,
ADD COLUMN     "domainName" TEXT,
ADD COLUMN     "domainPassword" TEXT,
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "seoContact" TEXT,
ADD COLUMN     "seoEmail" TEXT,
ADD COLUMN     "seoName" TEXT,
ADD COLUMN     "seoPassword" TEXT,
ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'ONGOING',
ALTER COLUMN "createdById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProjectMonthlySheetDay" ADD COLUMN     "contentUploadLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "videoUploadLinks" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "probationPeriod" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Payslip" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT,
    "remarks" TEXT,
    "sentEmail" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payslip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectDailyReport" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectDailyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Upload" (
    "id" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL,
    "clientName" TEXT NOT NULL,
    "totalUploads" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadItem" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "platform" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UploadItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoReport" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "keywords" TEXT[],
    "rankingNo" INTEGER NOT NULL,
    "checkDate" TIMESTAMP(3) NOT NULL,
    "screenshotUrl" TEXT NOT NULL,
    "screenshotPublicId" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payslip_userId_idx" ON "Payslip"("userId");

-- CreateIndex
CREATE INDEX "Payslip_month_year_idx" ON "Payslip"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Payslip_userId_month_year_key" ON "Payslip"("userId", "month", "year");

-- CreateIndex
CREATE INDEX "ProjectDailyReport_projectId_idx" ON "ProjectDailyReport"("projectId");

-- CreateIndex
CREATE INDEX "ProjectDailyReport_employeeId_idx" ON "ProjectDailyReport"("employeeId");

-- CreateIndex
CREATE INDEX "Upload_createdById_idx" ON "Upload"("createdById");

-- CreateIndex
CREATE INDEX "Upload_uploadDate_idx" ON "Upload"("uploadDate");

-- CreateIndex
CREATE INDEX "UploadItem_uploadId_idx" ON "UploadItem"("uploadId");

-- CreateIndex
CREATE INDEX "SeoReport_projectId_idx" ON "SeoReport"("projectId");

-- CreateIndex
CREATE INDEX "SeoReport_managerId_idx" ON "SeoReport"("managerId");

-- CreateIndex
CREATE INDEX "SeoReport_checkDate_idx" ON "SeoReport"("checkDate");

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDailyReport" ADD CONSTRAINT "ProjectDailyReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDailyReport" ADD CONSTRAINT "ProjectDailyReport_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadItem" ADD CONSTRAINT "UploadItem_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "Upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoReport" ADD CONSTRAINT "SeoReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoReport" ADD CONSTRAINT "SeoReport_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
