/*
  Warnings:

  - You are about to drop the column `referenceLink` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `tasteLink` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "referenceLink",
DROP COLUMN "tasteLink",
ADD COLUMN     "facebookUsername" TEXT,
ADD COLUMN     "instaUsername" TEXT,
ADD COLUMN     "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "taste" TEXT[] DEFAULT ARRAY[]::TEXT[];
