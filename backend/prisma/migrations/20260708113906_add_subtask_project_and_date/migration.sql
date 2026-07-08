/*
  Warnings:

  - You are about to drop the column `plannedDate` on the `ShootSubTask` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `ShootSubTask` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ShootSubTask" DROP CONSTRAINT "ShootSubTask_projectId_fkey";

-- DropIndex
DROP INDEX "ShootSubTask_projectId_idx";

-- AlterTable
ALTER TABLE "ShootSubTask" DROP COLUMN "plannedDate",
DROP COLUMN "projectId";
