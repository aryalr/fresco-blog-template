import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('🔄 Start seeding...');

  // 1. Baca file JSON
  const filePath = path.join(process.cwd(), 'app', 'data', 'data.json');
  console.log(`📖 Reading data from: ${filePath}`);
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  // 2. Bersihkan data lama
  console.log('🧹 Cleaning old data...');

  await prisma.team.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.service.deleteMany();
  await prisma.gallery.deleteMany();
  await prisma.about.deleteMany();
  await prisma.header.deleteMany();

  // 3. Insert Data Baru
  console.log('🌱 Inserting Header & About...');
  await prisma.header.create({ data: data.Header });

  await prisma.about.create({
    data: {
      paragraph: data.About.paragraph,
      why: data.About.Why,
      why2: data.About.Why2
    }
  });

  console.log('🌱 Inserting Arrays (Gallery, Services, etc)...');

  // CreateMany
  await prisma.gallery.createMany({ data: data.Gallery });

  // Perhatikan nama field di schema.prisma vs di JSON
  // Jika di Schema modelnya 'Service', maka panggil prisma.service
  await prisma.service.createMany({ data: data.Services });

  await prisma.testimonial.createMany({ data: data.Testimonials });
  await prisma.team.createMany({ data: data.Team });

  console.log('✅ Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
