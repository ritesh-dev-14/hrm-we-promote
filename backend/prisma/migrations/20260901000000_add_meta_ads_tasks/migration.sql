CREATE TYPE "MetaAdsObjective" AS ENUM ('LEAD', 'AWARENESS');
CREATE TYPE "MetaAdsFundsAddedBy" AS ENUM ('CLIENT', 'HARSH_SIR');

CREATE TABLE "MetaAdsTask" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "monthlyBudget" DOUBLE PRECISION NOT NULL,
    "objective" "MetaAdsObjective" NOT NULL,
    "area" TEXT NOT NULL,
    "fundsAddedBy" "MetaAdsFundsAddedBy" NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetaAdsTask_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MetaAdsTask_createdById_idx"
    ON "MetaAdsTask"("createdById");

CREATE INDEX "MetaAdsTask_assignedToId_idx"
    ON "MetaAdsTask"("assignedToId");

CREATE INDEX "MetaAdsTask_status_idx"
    ON "MetaAdsTask"("status");

ALTER TABLE "MetaAdsTask"
    ADD CONSTRAINT "MetaAdsTask_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MetaAdsTask"
    ADD CONSTRAINT "MetaAdsTask_assignedToId_fkey"
    FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
