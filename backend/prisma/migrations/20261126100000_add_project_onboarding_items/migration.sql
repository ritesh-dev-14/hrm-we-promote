CREATE TABLE "ProjectOnboardingItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectOnboardingItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProjectOnboardingItem_projectId_itemKey_key"
ON "ProjectOnboardingItem"("projectId", "itemKey");

CREATE INDEX "ProjectOnboardingItem_projectId_idx"
ON "ProjectOnboardingItem"("projectId");

ALTER TABLE "ProjectOnboardingItem"
ADD CONSTRAINT "ProjectOnboardingItem_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
