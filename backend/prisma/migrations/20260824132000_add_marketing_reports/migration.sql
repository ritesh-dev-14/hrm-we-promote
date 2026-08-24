CREATE TABLE "MarketingReport" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "clientName" TEXT,
    "clientContactNumber" TEXT,
    "videoLink" TEXT,
    "areaName" TEXT,
    "isAdRunning" BOOLEAN,
    "todayReachObtained" INTEGER,
    "todayAmountSpend" DOUBLE PRECISION,
    "reasonNotRunning" TEXT,
    "typeOfAds" TEXT,
    "leadObtained" INTEGER,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MarketingReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MarketingReport_projectId_idx" ON "MarketingReport"("projectId");
CREATE INDEX "MarketingReport_managerId_idx" ON "MarketingReport"("managerId");
CREATE INDEX "MarketingReport_date_idx" ON "MarketingReport"("date");

ALTER TABLE "MarketingReport"
ADD CONSTRAINT "MarketingReport_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MarketingReport"
ADD CONSTRAINT "MarketingReport_managerId_fkey"
FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;