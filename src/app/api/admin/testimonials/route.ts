import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from 'next/server';
import { testimonialSchema, testimonialUpdateSchema } from '@/lib/validations';

export async function GET(request: NextApiRequest, response: NextApiResponse) {
  try {
    const session = await auth(request, response);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url!);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const whereClause = search ? {
      OR: [
        { name: { contains: search } },
        { role: { contains: search } },
        { content: { contains: search } },
      ],
    } : {};

    const testimonials = await db.testimonial.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const totalCount = await db.testimonial.count({
      where: whereClause,
    });

    return NextResponse.json({
      testimonials,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export async function POST(request: any, response: NextApiResponse) {
  try {
    const session = await auth(request, response);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const result = testimonialSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const { name, role, content, avatar } = result.data;

    const newTestimonial = await db.testimonial.create({
      data: {
        name,
        role,
        content,
        avatar: avatar || "",
      },
    });

    return NextResponse.json(newTestimonial, { status: 201 });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}

export async function PUT(request: any, response: NextApiResponse) {
  try {
    const session = await auth(request, response);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const result = testimonialUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const { id, name, role, content, avatar } = result.data;

    const updatedTestimonial = await db.testimonial.update({
      where: { id },
      data: {
        name,
        role,
        content,
        avatar,
      },
    });

    return NextResponse.json(updatedTestimonial);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

export async function DELETE(request: NextApiRequest, response: NextApiResponse) {
  try {
    const session = await auth(request, response);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url!);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Testimonial ID is required' }, { status: 400 });
    }

    await db.testimonial.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}
