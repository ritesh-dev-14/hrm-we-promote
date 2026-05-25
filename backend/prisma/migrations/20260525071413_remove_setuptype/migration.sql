/*
  Warnings:

  - You are about to drop the column `instructions` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `isGroupTask` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `referenceLink` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `setupType` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `taskGroupId` on the `TaskAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `instructions` on the `TaskItem` table. All the data in the column will be lost.
  - You are about to drop the column `referenceLink` on the `TaskItem` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `TaskItem` table. All the data in the column will be lost.
  - You are about to drop the column `taskGroupId` on the `TaskItemAssignment` table. All the data in the column will be lost.
  - You are about to drop the `TaskGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskGroupMember` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `endDate` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `projectName` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `startDate` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `dueDate` to the `TaskItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- DropForeignKey
ALTER TABLE "TaskAssignment" DROP CONSTRAINT "TaskAssignment_taskGroupId_fkey";

-- DropForeignKey
ALTER TABLE "TaskGroup" DROP CONSTRAINT "TaskGroup_managerId_fkey";

-- DropForeignKey
ALTER TABLE "TaskGroupMember" DROP CONSTRAINT "TaskGroupMember_groupId_fkey";

-- DropForeignKey
ALTER TABLE "TaskGroupMember" DROP CONSTRAINT "TaskGroupMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "TaskItemAssignment" DROP CONSTRAINT "TaskItemAssignment_taskGroupId_fkey";

-- DropIndex
DROP INDEX "TaskAssignment_taskGroupId_idx";

-- DropIndex
DROP INDEX "TaskItemAssignment_taskGroupId_idx";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "instructions",
DROP COLUMN "isGroupTask",
DROP COLUMN "location",
DROP COLUMN "referenceLink",
DROP COLUMN "setupType",
ALTER COLUMN "endDate" SET NOT NULL,
ALTER COLUMN "projectName" SET NOT NULL,
ALTER COLUMN "startDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "TaskAssignment" DROP COLUMN "taskGroupId";

-- AlterTable
ALTER TABLE "TaskItem" DROP COLUMN "instructions",
DROP COLUMN "referenceLink",
DROP COLUMN "theme",
ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM';

-- AlterTable
ALTER TABLE "TaskItemAssignment" DROP COLUMN "taskGroupId";

-- DropTable
DROP TABLE "TaskGroup";

-- DropTable
DROP TABLE "TaskGroupMember";
