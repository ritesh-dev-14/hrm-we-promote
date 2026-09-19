ALTER TABLE "TaskItem"
ADD COLUMN "clientApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "clientApprovedAt" TIMESTAMP(3),
ADD COLUMN "clientApprovedById" TEXT,
ADD COLUMN "instagramUploaded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "instagramUploadedAt" TIMESTAMP(3),
ADD COLUMN "instagramUploadedById" TEXT;

CREATE INDEX "TaskItem_clientApprovedById_idx" ON "TaskItem"("clientApprovedById");
CREATE INDEX "TaskItem_instagramUploadedById_idx" ON "TaskItem"("instagramUploadedById");

ALTER TABLE "TaskItem"
ADD CONSTRAINT "TaskItem_clientApprovedById_fkey"
FOREIGN KEY ("clientApprovedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TaskItem"
ADD CONSTRAINT "TaskItem_instagramUploadedById_fkey"
FOREIGN KEY ("instagramUploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
