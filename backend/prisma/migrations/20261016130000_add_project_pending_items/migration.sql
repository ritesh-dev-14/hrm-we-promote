CREATE TABLE "ProjectPendingItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectPendingItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProjectPendingItem_projectId_dueDate_idx"
ON "ProjectPendingItem"("projectId", "dueDate");

CREATE INDEX "ProjectPendingItem_createdById_idx"
ON "ProjectPendingItem"("createdById");

ALTER TABLE "ProjectPendingItem"
ADD CONSTRAINT "ProjectPendingItem_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectPendingItem"
ADD CONSTRAINT "ProjectPendingItem_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
