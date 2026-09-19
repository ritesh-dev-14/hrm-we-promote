ALTER TABLE "TaskItem"
ADD COLUMN "shootSubTaskId" TEXT,
ADD COLUMN "shootExtraContentId" TEXT;

CREATE INDEX "TaskItem_shootSubTaskId_idx" ON "TaskItem"("shootSubTaskId");
CREATE INDEX "TaskItem_shootExtraContentId_idx" ON "TaskItem"("shootExtraContentId");

ALTER TABLE "TaskItem"
ADD CONSTRAINT "TaskItem_shootSubTaskId_fkey"
FOREIGN KEY ("shootSubTaskId") REFERENCES "ShootSubTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TaskItem"
ADD CONSTRAINT "TaskItem_shootExtraContentId_fkey"
FOREIGN KEY ("shootExtraContentId") REFERENCES "ShootExtraContent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
