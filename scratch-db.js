const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const profiles = await prisma.profile.findMany();
    console.log('Current Database Profiles:');
    profiles.forEach((p, idx) => {
      console.log(`[Profile ${idx+1}] ID: ${p.id} Name: ${p.fullName}`);
      console.log(`  avatarUrl: ${p.avatarUrl}`);
      console.log(`  occupation: ${p.occupation}`);
    });
  } catch (err) {
    console.error('Error running script:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
