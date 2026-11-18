import { PrismaClient } from '@prisma/client';

// Prevent multiple client instances during Next.js development hot-reloading.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  // If the cached client exists but does not have the savingsGoal delegate, refresh it
  if (!globalForPrisma.prisma || !('savingsGoal' in (globalForPrisma.prisma as any))) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;

