ALTER TABLE "TaskItem"
ADD COLUMN "monthlySheetDayId" TEXT;

CREATE INDEX "TaskItem_monthlySheetDayId_idx" ON "TaskItem"("monthlySheetDayId");

ALTER TABLE "TaskItem"
ADD CONSTRAINT "TaskItem_monthlySheetDayId_fkey"
FOREIGN KEY ("monthlySheetDayId") REFERENCES "ProjectMonthlySheetDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;
