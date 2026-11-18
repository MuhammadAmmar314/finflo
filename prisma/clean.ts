import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clean() {
  // Delete child records first to respect foreign key constraints
  await prisma.verificationCode.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.debt.deleteMany();
  await prisma.expenseCategory.deleteMany();
  await prisma.incomeCategory.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  console.log('Semua tabel database berhasil dikosongkan.');
}

clean()
  .catch((e) => {
    console.error('Gagal mengosongkan database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
