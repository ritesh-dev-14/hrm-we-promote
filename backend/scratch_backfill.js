const prisma = require('./src/config/prisma');

async function backfillMonthlySheets() {
  console.log("Starting backfill for monthly sheets based on verified tasks...");
  try {
    const verifiedAssignments = await prisma.taskItemAssignment.findMany({
      where: {
        status: "VERIFIED"
      },
      include: {
        taskItem: {
          include: {
            task: true
          }
        }
      }
    });

    console.log(`Found ${verifiedAssignments.length} verified task assignments.`);

    const projectCounts = {};

    for (const assignment of verifiedAssignments) {
      const task = assignment.taskItem.task;
      const projectName = task.projectName;
      
      if (!projectName) continue;

      if (!projectCounts[projectName]) {
        projectCounts[projectName] = { reels: 0, posts: 0 };
      }

      const isReel = assignment.taskItem.title.toLowerCase().includes('reel') || 
                     (assignment.taskItem.theme && assignment.taskItem.theme.toLowerCase().includes('reel'));
                     
      if (isReel) {
        projectCounts[projectName].reels++;
      } else {
        projectCounts[projectName].posts++;
      }
    }

    console.log("Calculated retro-active counts:", projectCounts);

    for (const [projectName, counts] of Object.entries(projectCounts)) {
      const project = await prisma.project.findFirst({
        where: { projectName }
      });
      
      if (!project) continue;

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      const monthlySheet = await prisma.projectMonthlySheet.findFirst({
        where: {
          projectId: project.id,
          month: currentMonth,
          year: currentYear
        }
      });
      
      if (monthlySheet) {
        await prisma.projectMonthlySheet.update({
          where: { id: monthlySheet.id },
          data: {
            totalReelsUploaded: counts.reels, // Set directly to calculated count
            totalPostsUploaded: counts.posts
          }
        });
        console.log(`Updated Monthly Sheet for project "${projectName}": ${counts.reels} Reels, ${counts.posts} Posts`);
      }
    }

    console.log("Backfill complete.");
  } catch (err) {
    console.error("Error during backfill:", err);
  } finally {
    await prisma.$disconnect();
  }
}

backfillMonthlySheets();
