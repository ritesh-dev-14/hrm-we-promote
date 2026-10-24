DROP INDEX IF EXISTS "ProjectMonthlySheetDay_sheetId_date_key";
DROP INDEX IF EXISTS "ProjectMonthlySheetDay_sheetId_idx";

CREATE INDEX IF NOT EXISTS "ProjectMonthlySheetDay_sheetId_date_idx"
ON "ProjectMonthlySheetDay"("sheetId", "date");
