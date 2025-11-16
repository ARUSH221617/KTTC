import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Handles GET requests to the /api/courses endpoint.
 *
 * @param {NextRequest} request - The incoming request.
 * @returns {Promise<NextResponse>} The response.
 */
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
        { instructor: { contains: search, mode: 'insensitive' } }
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

/**
 * Handles POST requests to the /api/courses endpoint.
 *
 * @param {NextRequest} request - The incoming request.
 * @returns {Promise<NextResponse>} The response.
 */
export async function POST(request: NextRequest) {
  try {
    const { title, description, category, level, duration, instructor, thumbnail } = await request.json();

    // Validate required fields
    if (!title || !description || !category || !level || !duration || !instructor) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Create new course
    const course = await db.course.create({
      data: {
        title,
        description,
        category,
        level,
        duration,
        instructor,
        thumbnail: thumbnail || null,
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