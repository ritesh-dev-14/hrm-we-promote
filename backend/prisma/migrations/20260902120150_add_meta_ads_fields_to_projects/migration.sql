-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "area" TEXT,
ADD COLUMN     "fundsAddedBy" "MetaAdsFundsAddedBy",
ADD COLUMN     "monthlyBudget" DOUBLE PRECISION,
ADD COLUMN     "objective" "MetaAdsObjective";
