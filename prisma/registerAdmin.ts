import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

async function main(){
  const email = 'admin@fresco.com';
  const password = 'admin123';

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
    }
  });

  console.log(`Akun admin berhasil dibuat dengan email: ${user.email}`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect);
