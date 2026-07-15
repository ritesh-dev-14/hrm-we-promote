const prisma = require("../config/prisma");

/**
 * Increment the unread count for a given user and sidebar menuId.
 * menuId can be: "projects", "shoots", "creative", "editor"
 */
const incrementUnread = async (userId, menuId) => {
  if (!userId || !menuId) return;
  try {
    await prisma.sidebarUnread.upsert({
      where: {
        userId_menuId: { userId, menuId },
      },
      update: {
        count: { increment: 1 },
      },
      create: {
        userId,
        menuId,
        count: 1,
      },
    });
  } catch (err) {
    console.error(`[SidebarUnread] Failed to increment for user=${userId} menu=${menuId}:`, err.message);
  }
};

/**
 * Reset the unread count to 0 for a given user and sidebar menuId.
 */
const resetUnread = async (userId, menuId) => {
  if (!userId || !menuId) return;
  try {
    await prisma.sidebarUnread.upsert({
      where: {
        userId_menuId: { userId, menuId },
      },
      update: {
        count: 0,
      },
      create: {
        userId,
        menuId,
        count: 0,
      },
    });
  } catch (err) {
    console.error(`[SidebarUnread] Failed to reset for user=${userId} menu=${menuId}:`, err.message);
  }
};

/**
 * Get all unread counts for a user.
 * Returns an object like: { projects: 3, shoots: 1, creative: 0, editor: 0 }
 */
const getUnreads = async (userId) => {
  if (!userId) return {};
  try {
    const records = await prisma.sidebarUnread.findMany({
      where: { userId },
    });

    const result = { projects: 0, shoots: 0, creative: 0, editor: 0 };
    for (const r of records) {
      if (r.menuId in result) {
        result[r.menuId] = r.count;
      }
    }
    return result;
  } catch (err) {
    console.error(`[SidebarUnread] Failed to get unreads for user=${userId}:`, err.message);
    return { projects: 0, shoots: 0, creative: 0, editor: 0 };
  }
};

module.exports = { incrementUnread, resetUnread, getUnreads };
