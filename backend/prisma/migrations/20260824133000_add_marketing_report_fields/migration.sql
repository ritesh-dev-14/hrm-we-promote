ALTER TABLE "MarketingReport"
ADD COLUMN "decidedDailyBudget" DOUBLE PRECISION,
ADD COLUMN "leadSentToClient" BOOLEAN,
ADD COLUMN "startDate" TIMESTAMP(3),
ADD COLUMN "campaignStartDate" TIMESTAMP(3);