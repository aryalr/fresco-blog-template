import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma.ts'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(request, context) {
  // TODO: Tambahkan pengecekan autentikasi disini
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { section = '' } = context.params || {};
  
  const data = await request.json();

  try {
    let updatedRecord;
    switch (section.toLowerCase()) {
      case 'header':
        updatedRecord = await prisma.header.upsert({
          where: { id: 1 },
          update: { title: data.title, paragraph: data.paragraph },
          create: { id: 1, title: data.title, paragraph: data.paragraph },
        });
        break;
      case 'about':
        updatedRecord = await prisma.about.upsert({
          where: { id: 1 },
          update: { paragraph: data.paragraph },
          create: { id: 1, paragraph: data.paragraph, why: [], why2: [] },
        });
        break;
      // Tambahkan case untuk section lain disini
      default:
        return NextResponse.json({ message: 'Section not found' }, { status: 404 });
    }
    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error(`Error updating ${section}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }

}
