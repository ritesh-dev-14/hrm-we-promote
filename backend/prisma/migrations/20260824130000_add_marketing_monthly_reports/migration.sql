ALTER TABLE "Project"
ADD COLUMN "reasons" JSONB DEFAULT '[]'::jsonb;

CREATE TABLE "MarketingMonthlyReport" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MarketingMonthlyReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketingMonthlyReportRow" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "awarenessEnabled" BOOLEAN NOT NULL,
    "awarenessArea" TEXT,
    "awarenessFunds" DOUBLE PRECISION,
    "leadAdsEnabled" BOOLEAN NOT NULL,
    "leadsFund" DOUBLE PRECISION,
    "leadArea" TEXT,
    "requiredLeads" INTEGER,
    "adsStartingDate" TIMESTAMP(3),
    "monthlyBudget" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MarketingMonthlyReportRow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketingMonthlyReportRemark" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "remark" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MarketingMonthlyReportRemark_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MarketingMonthlyReport_month_year_key"
ON "MarketingMonthlyReport"("month", "year");
CREATE INDEX "MarketingMonthlyReport_managerId_idx"
ON "MarketingMonthlyReport"("managerId");
CREATE INDEX "MarketingMonthlyReportRow_reportId_idx"
ON "MarketingMonthlyReportRow"("reportId");
CREATE INDEX "MarketingMonthlyReportRow_projectId_idx"
ON "MarketingMonthlyReportRow"("projectId");
CREATE INDEX "MarketingMonthlyReportRemark_reportId_idx"
ON "MarketingMonthlyReportRemark"("reportId");
CREATE INDEX "MarketingMonthlyReportRemark_managerId_idx"
ON "MarketingMonthlyReportRemark"("managerId");

ALTER TABLE "MarketingMonthlyReport"
ADD CONSTRAINT "MarketingMonthlyReport_managerId_fkey"
FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MarketingMonthlyReportRow"
ADD CONSTRAINT "MarketingMonthlyReportRow_reportId_fkey"
FOREIGN KEY ("reportId") REFERENCES "MarketingMonthlyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingMonthlyReportRow"
ADD CONSTRAINT "MarketingMonthlyReportRow_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingMonthlyReportRemark"
ADD CONSTRAINT "MarketingMonthlyReportRemark_reportId_fkey"
FOREIGN KEY ("reportId") REFERENCES "MarketingMonthlyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingMonthlyReportRemark"
ADD CONSTRAINT "MarketingMonthlyReportRemark_managerId_fkey"
FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;