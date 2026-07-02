const prisma = require('./src/config/prisma');
(async () => {
  const user = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true, employeeId: true, name: true, role: true } });
  const manager = await prisma.user.findUnique({ where: { employeeId: 'MGR-1782976484647' }, select: { id: true, employeeId: true, name: true, role: true } });
  console.log(JSON.stringify({ user, manager }, null, 2));
})();
