import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 6
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, role, content, avatar } = await request.json();

    // Validate required fields
    if (!name || !role || !content) {
      return NextResponse.json(
        { error: 'Name, role, and content are required' },
        { status: 400 }
      );
    }

    // Create new testimonial
    const testimonial = await db.testimonial.create({
      data: {
        name,
        role,
        content,
        avatar: avatar || null,
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Testimonial created successfully',
        testimonial 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}