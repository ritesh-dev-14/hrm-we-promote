-- CreateEnum
CREATE TYPE "MediaSource" AS ENUM ('SHOOT', 'AI');

-- CreateTable
CREATE TABLE "ProjectMonthlySheet" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalReels" INTEGER NOT NULL,
    "totalPosts" INTEGER NOT NULL,
    "totalReelsUploaded" INTEGER NOT NULL,
    "totalPostsUploaded" INTEGER NOT NULL,
    "moodBoardLink" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMonthlySheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMonthlySheetDay" (
    "id" TEXT NOT NULL,
    "sheetId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reelType" "MediaSource" NOT NULL,
    "postType" "MediaSource" NOT NULL,
    "script" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMonthlySheetDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectMonthlySheet_projectId_idx" ON "ProjectMonthlySheet"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMonthlySheet_createdById_idx" ON "ProjectMonthlySheet"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMonthlySheet_projectId_month_year_key" ON "ProjectMonthlySheet"("projectId", "month", "year");

-- CreateIndex
CREATE INDEX "ProjectMonthlySheetDay_sheetId_idx" ON "ProjectMonthlySheetDay"("sheetId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMonthlySheetDay_sheetId_date_key" ON "ProjectMonthlySheetDay"("sheetId", "date");

-- AddForeignKey
ALTER TABLE "ProjectMonthlySheet" ADD CONSTRAINT "ProjectMonthlySheet_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMonthlySheet" ADD CONSTRAINT "ProjectMonthlySheet_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMonthlySheetDay" ADD CONSTRAINT "ProjectMonthlySheetDay_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "ProjectMonthlySheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
