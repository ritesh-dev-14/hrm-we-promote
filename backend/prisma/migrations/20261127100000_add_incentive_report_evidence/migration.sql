ALTER TABLE "MarketingReport"
ADD COLUMN "unableToSubmitScreenshotUrl" TEXT,
ADD COLUMN "unableToSubmitScreenshotPublicId" TEXT;

CREATE TABLE "SeoUnableSubmission" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "reportDate" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "screenshotUrl" TEXT NOT NULL,
    "screenshotPublicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoUnableSubmission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SeoUnableSubmission_projectId_managerId_reportDate_key"
ON "SeoUnableSubmission"("projectId", "managerId", "reportDate");

CREATE INDEX "SeoUnableSubmission_managerId_reportDate_idx"
ON "SeoUnableSubmission"("managerId", "reportDate");

CREATE INDEX "SeoUnableSubmission_projectId_reportDate_idx"
ON "SeoUnableSubmission"("projectId", "reportDate");

ALTER TABLE "SeoUnableSubmission"
ADD CONSTRAINT "SeoUnableSubmission_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SeoUnableSubmission"
ADD CONSTRAINT "SeoUnableSubmission_managerId_fkey"
FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
