import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { courseSchema } from '@/lib/validations';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';

    // Build where clause
    const where: any = {};
    
    if (category && category !== 'All') {
      where.category = category;
    }
    
    if (level && level !== 'All') {
      where.level = level;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { instructor: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Build order clause
    const order: any = {};
    switch (sortBy) {
      case 'title':
        order.title = 'asc';
        break;
      case 'createdAt':
        order.createdAt = 'desc';
        break;
      case 'popularity':
        order.popularity = 'desc';
        break;
      default:
        order.createdAt = 'desc';
    }

    const courses = await db.course.findMany({
      where,
      orderBy: order,
      include: {
        instructor: {
          select: {
            name: true,
          }
        }
      }
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate admin
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const result = courseSchema.safeParse(body);

    if (!result.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: result.error.format() },
            { status: 400 }
        );
    }

    const { title, description, category, level, duration, instructorId, thumbnail, price } = result.data;

    // Create new course
    const course = await db.course.create({
      data: {
        title,
        description,
        category,
        level,
        duration,
        instructor: { connect: { id: instructorId } },
        thumbnail: thumbnail ?? "",
        price,
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Course created successfully',
        course 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
