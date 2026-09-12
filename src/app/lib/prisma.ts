import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
  });
};

type GlobalWithPrisma = typeof globalThis & {
  prisma: ReturnType<typeof prismaClientSingleton>;
};

const globalForPrisma = globalThis as GlobalWithPrisma;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prismaClientSingleton();
}

const prisma = globalForPrisma.prisma;

export default prisma; 