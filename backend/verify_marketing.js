const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.marketingReport.count()
  .then(c => console.log('MarketingReport table OK, row count:', c))
  .catch(e => console.error('ERROR:', e.message))
  .finally(() => p.$disconnect());
