import { NextResponse } from 'next/server';
import {prisma} from '../../../lib/prisma'

export async function PUT(request, {params}) {
  // TODO: Tambahkan pengecekan autentikasi disini

  const { section } = params;
  const data = await request.json();

  try {
    let updatedRecord;
    switch (section) {
      case 'header':
        updatedRecord = await prisma.header.update({
          where: { id: 1 },
          data: { title: data.title, paragraph: data.paragraph },
        });
        break;
      case 'about':
        updatedRecord = await prisma.about.update({
          where: { id: 1 },
          data: { paragraph: data.paragraph },
        });
        break;
      // Tambahkan case untuk section lain disini
      default:
        return NextResponse.json({ message: 'Section not found' }, { status: 404 });
    }
    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error(`Error updating ${section}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }

}
