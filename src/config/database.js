const { PrismaClient } = require('@prisma/client');

// Create a singleton instance of Prisma Client
const prisma = new PrismaClient();

// Handle potential connection errors
prisma.$connect()
  .then(() => {
    console.log('Successfully connected to the database');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  });

// Handle application shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Disconnected from database');
  process.exit(0);
});

module.exports = prisma;