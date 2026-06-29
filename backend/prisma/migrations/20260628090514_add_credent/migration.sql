-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "clientName" TEXT,
ADD COLUMN     "fbEmail" TEXT,
ADD COLUMN     "fbPassword" TEXT,
ADD COLUMN     "instaEmail" TEXT,
ADD COLUMN     "instaPassword" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "projectStartDate" TIMESTAMP(3);
