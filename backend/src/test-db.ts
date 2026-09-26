import { PrismaClient } from '@prisma/client';

async function testPrisma() {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    const count = await prisma.source.count();
    console.log('Successfully connected to SQLite database via Prisma. Source count:', count);
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
