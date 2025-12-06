import { NextResponse } from 'next/server';
import {prisma} from '../../../lib/prisma'

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
          "icon": "fa fa-comments-o",
          "title": "Lorem ipsum",
          "text": "Lorem ipsum dolor sit amet placerat facilisis felis mi in tempus eleifend pellentesque natoque etiam."
        },
        {
          "icon": "fa fa-bullhorn",
          "title": "Lorem ipsum",
          "text": "Lorem ipsum dolor sit amet placerat facilisis felis mi in tempus eleifend pellentesque natoque etiam."
        },
        {
          "icon": "fa fa-group",
          "title": "Lorem ipsum",
          "text": "Lorem ipsum dolor sit amet placerat facilisis felis mi in tempus eleifend pellentesque natoque etiam."
        },
        {
          "icon": "fa fa-magic",
          "title": "Lorem ipsum",
          "text": "Lorem ipsum dolor sit amet placerat facilisis felis mi in tempus eleifend pellentesque natoque etiam."
        }
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
    console.error("Error fetching content:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
