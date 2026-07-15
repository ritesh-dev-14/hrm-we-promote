-- CreateTable
CREATE TABLE "SidebarUnread" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SidebarUnread_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SidebarUnread_userId_idx" ON "SidebarUnread"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SidebarUnread_userId_menuId_key" ON "SidebarUnread"("userId", "menuId");

-- AddForeignKey
ALTER TABLE "SidebarUnread" ADD CONSTRAINT "SidebarUnread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
