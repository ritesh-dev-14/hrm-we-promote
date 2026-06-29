-- AlterTable
ALTER TABLE "ShootSubTask" ALTER COLUMN "setupType" DROP NOT NULL,
ALTER COLUMN "setupType" SET DEFAULT 'PREMIUM';

-- AlterTable
ALTER TABLE "ShootTask" ADD COLUMN     "arrivalTime" TEXT,
ADD COLUMN     "date" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "setupType" "SetupType";
