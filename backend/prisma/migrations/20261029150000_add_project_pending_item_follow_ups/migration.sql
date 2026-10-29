CREATE TABLE "ProjectPendingItemFollowUp" (
    "id" TEXT NOT NULL,
    "pendingItemId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "audioUrl" TEXT,
    "screenshots" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectPendingItemFollowUp_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProjectPendingItemFollowUp_pendingItemId_createdAt_idx"
ON "ProjectPendingItemFollowUp"("pendingItemId", "createdAt");

CREATE INDEX "ProjectPendingItemFollowUp_submittedById_idx"
ON "ProjectPendingItemFollowUp"("submittedById");

ALTER TABLE "ProjectPendingItemFollowUp"
ADD CONSTRAINT "ProjectPendingItemFollowUp_pendingItemId_fkey"
FOREIGN KEY ("pendingItemId") REFERENCES "ProjectPendingItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectPendingItemFollowUp"
ADD CONSTRAINT "ProjectPendingItemFollowUp_submittedById_fkey"
FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
