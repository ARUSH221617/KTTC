import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { list } from '@vercel/blob';
import { db } from '@/lib/db';
import { validateAdminSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token')?.value;

    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isValid = await validateAdminSession(adminToken);
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const cursor = searchParams.get('cursor') || undefined;
    const search = searchParams.get('search') || undefined;

    // 1. List blobs with pagination and prefix search
    const { blobs, hasMore, cursor: nextCursor } = await list({
      limit,
      cursor,
      prefix: search,
    });

    // 2. Fetch all DB data relevant to media usage
    // Note: We fetch all because we need to check if ANY record uses the blobs on THIS page.
    // In a massive system, we would have a 'Media' table with relations, but here we scan.
    const courses = await db.course.findMany({
      select: {
        id: true,
        title: true,
        thumbnail: true,
        description: true,
      },
    });

    const testimonials = await db.testimonial.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        content: true,
      },
    });

    const contacts = await db.contact.findMany({
        select: {
            id: true,
            message: true
        }
    })

    // 3. Check usage for each blob
    const blobsWithUsage = blobs.map((blob) => {
      const usage: { count: number; locations: string[] } = {
        count: 0,
        locations: [],
      };

      const blobUrl = blob.url;

      // Check Courses
      courses.forEach((course) => {
        if (course.thumbnail === blobUrl) {
          usage.count++;
          usage.locations.push(`Course Thumbnail: ${course.title}`);
        }
        if (course.description?.includes(blobUrl)) {
          usage.count++;
          usage.locations.push(`Course Description: ${course.title}`);
        }
      });

      // Check Testimonials
      testimonials.forEach((testimonial) => {
        if (testimonial.avatar === blobUrl) {
            usage.count++;
            usage.locations.push(`Testimonial Avatar: ${testimonial.name}`);
        }
        if (testimonial.content?.includes(blobUrl)) {
            usage.count++;
            usage.locations.push(`Testimonial Content: ${testimonial.name}`);
        }
      });

      // Check Contacts
      contacts.forEach(contact => {
          if (contact.message?.includes(blobUrl)) {
              usage.count++;
              usage.locations.push(`Contact Message: ${contact.id}`)
          }
      })

      return {
        ...blob,
        usage,
      };
    });

    return NextResponse.json({
      blobs: blobsWithUsage,
      hasMore,
      nextCursor
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
