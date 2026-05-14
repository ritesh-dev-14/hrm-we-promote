/*
  Warnings:

  - You are about to drop the column `description` on the `Department` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Department` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Department" DROP COLUMN "description",
DROP COLUMN "isActive";
