import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.ts';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const header = await prisma.header.findFirst({ where: { id: 1 } });
    const about = await prisma.about.findFirst({ where: { id: 1 } });
    const gallery = await prisma.gallery.findMany();
    const services = await prisma.service.findMany();
    const testimonials = await prisma.testimonial.findMany();
    const team = await prisma.team.findMany();

    // Mengambil data Features statis karena tidak ada di DB
    const featuresData = [
      {
        icon: 'fa fa-comments-o',
        title: 'Lorem ipsum',
        text: 'Lorem ipsum dolor sit amet placerat facilisis felis mi in tempus eleifend pellentesque natoque etiam.',
      },
      {
        icon: 'fa fa-bullhorn',
        title: 'Lorem ipsum',
        text: 'Lorem ipsum dolor sit amet placerat facilisis felis mi in tempus eleifend pellentesque natoque etiam.',
      },
      {
        icon: 'fa fa-group',
        title: 'Lorem ipsum',
        text: 'Lorem ipsum dolor sit amet placerat facilisis felis mi in tempus eleifend pellentesque natoque etiam.',
      },
      {
        icon: 'fa fa-magic',
        title: 'Lorem ipsum',
        text: 'Lorem ipsum dolor sit amet placerat facilisis felis mi in tempus eleifend pellentesque natoque etiam.',
      },
    ];

    const landingPageData = {
      Header: header,
      About: about,
      Gallery: gallery,
      Services: services,
      Testimonials: testimonials,
      Team: team,
      Features: featuresData, // Data statis
    };

    return NextResponse.json(landingPageData);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section') || '';

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
