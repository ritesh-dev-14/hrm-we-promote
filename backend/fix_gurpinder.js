require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const seoDept = await prisma.department.findUnique({
    where: { name: 'SEO Department' }
  });

  if (seoDept) {
    const updated = await prisma.user.updateMany({
      where: { name: 'Gurpinder' },
      data: { departmentId: seoDept.id }
    });
    console.log(`Updated Gurpinder to SEO Department: ${updated.count} records`);
  } else {
    console.log("SEO Department not found");
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
