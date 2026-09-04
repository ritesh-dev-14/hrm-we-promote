/*
  Warnings:

  - You are about to drop the column `monthlyBudget` on the `MarketingMonthlyReportRow` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MarketingReportApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "MarketingMonthlyReportRow" DROP COLUMN "monthlyBudget";

-- AlterTable
ALTER TABLE "MarketingReport" ADD COLUMN     "approvalStatus" "MarketingReportApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "reviewNote" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT,
ADD COLUMN     "unableToSubmitReason" TEXT;

-- CreateIndex
CREATE INDEX "MarketingReport_reviewedById_idx" ON "MarketingReport"("reviewedById");

-- AddForeignKey
ALTER TABLE "MarketingReport" ADD CONSTRAINT "MarketingReport_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
