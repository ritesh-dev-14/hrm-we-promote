const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findUnique({where: {email: 'employee@test.com'}}).then(users => console.log(users)).finally(() => prisma.$disconnect());
