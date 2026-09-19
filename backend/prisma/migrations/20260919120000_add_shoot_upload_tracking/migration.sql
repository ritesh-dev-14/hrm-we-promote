-- Add explicit mapping from editor task items to shoot tasks.
ALTER TABLE "TaskItem" ADD COLUMN "shootTaskId" TEXT;

CREATE INDEX "TaskItem_shootTaskId_idx" ON "TaskItem"("shootTaskId");

ALTER TABLE "TaskItem"
ADD CONSTRAINT "TaskItem_shootTaskId_fkey"
FOREIGN KEY ("shootTaskId") REFERENCES "ShootTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

