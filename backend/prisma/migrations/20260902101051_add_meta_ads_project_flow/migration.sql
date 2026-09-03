-- AlterEnum
ALTER TYPE "MetaAdsFundsAddedBy" ADD VALUE 'HARSH';

-- AlterEnum
ALTER TYPE "MetaAdsObjective" ADD VALUE 'BOTH';

-- AlterTable
ALTER TABLE "MetaAdsTask" ADD COLUMN     "projectName" TEXT,
ALTER COLUMN "clientName" DROP NOT NULL;
