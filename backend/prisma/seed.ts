import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.setting.upsert({
    where: { key: 'phase' },
    update: {},
    create: { key: 'phase', value: 'CANDIDATURA' }
  });

  const count = await prisma.candidate.count();
  if (count === 0) {
    await prisma.candidate.createMany({
      data: [
        { name: 'Ana Souza', gradeYear: '8º Ano EF', classLetter: 'A', status: 'APROVADO' },
        { name: 'Carlos Lima', gradeYear: '1º Ano EM', classLetter: 'B', status: 'PENDENTE' }
      ]
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
