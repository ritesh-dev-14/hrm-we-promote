ALTER TABLE "TaskItem"
ADD COLUMN "referenceLinks" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "rawDataLinks" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "TaskItem"
SET
  "referenceLinks" = CASE
    WHEN "referenceLink" IS NULL OR btrim("referenceLink") = '' THEN ARRAY[]::TEXT[]
    ELSE ARRAY["referenceLink"]
  END,
  "rawDataLinks" = CASE
    WHEN "rawDataLink" IS NULL OR btrim("rawDataLink") = '' THEN ARRAY[]::TEXT[]
    ELSE ARRAY["rawDataLink"]
  END;
