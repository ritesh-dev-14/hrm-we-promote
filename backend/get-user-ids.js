const prisma = require("./src/config/prisma");

async function main() {
  console.log("\n📋 All Users in Database:\n");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      employeeId: true,
      role: true,
    },
  });

  users.forEach((user) => {
    console.log(`Role: ${user.role}`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Employee ID: ${user.employeeId}`);
    console.log("");
  });

  process.exit(0);
}

main().catch(console.error);
