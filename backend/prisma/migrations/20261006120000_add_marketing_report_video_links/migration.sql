ALTER TABLE "MarketingReport"
ADD COLUMN IF NOT EXISTS "videoLinks" JSONB;

UPDATE "MarketingReport"
SET "videoLinks" = jsonb_build_array("videoLink")
WHERE "videoLink" IS NOT NULL
  AND "videoLinks" IS NULL;
