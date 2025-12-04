import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { del, put } from '@vercel/blob';
import { db } from '@/lib/db';
import { validateAdminSession } from '@/lib/auth';
import sharp from 'sharp';

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token')?.value;

    if (!adminToken || !(await validateAdminSession(adminToken))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    await del(url);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token')?.value;

    if (!adminToken || !(await validateAdminSession(adminToken))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'replace_confirm') {
      const { oldUrl, newUrl } = body;
      if (!oldUrl || !newUrl) {
        return NextResponse.json({ error: 'Missing URLs' }, { status: 400 });
      }

      // Update DB references
      await updateDatabaseReferences(oldUrl, newUrl);

      // Delete old blob
      await del(oldUrl);

      return NextResponse.json({ success: true });

    } else if (action === 'optimize') {
      const { url } = body;
      if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
      }

      // 1. Download image
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch image');
      const buffer = Buffer.from(await response.arrayBuffer());

      // 2. Convert to WebP
      const optimizedBuffer = await sharp(buffer)
        .webp({ quality: 80 })
        .toBuffer();

      // 3. Upload new blob
      // Preserve filename but change extension
      const filename = url.split('/').pop()?.split('.')[0] + '.webp' || 'optimized.webp';
      const { url: newUrl } = await put(filename, optimizedBuffer, {
        access: 'public',
        contentType: 'image/webp',
      });

      // 4. Update DB references
      await updateDatabaseReferences(url, newUrl);

      // 5. Delete old blob
      await del(url);

      return NextResponse.json({ success: true, newUrl });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error processing media action:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function updateDatabaseReferences(oldUrl: string, newUrl: string) {
  // Update Course Thumbnails
  await db.course.updateMany({
    where: { thumbnail: oldUrl },
    data: { thumbnail: newUrl },
  });

  // Update Testimonial Avatars
  await db.testimonial.updateMany({
    where: { avatar: oldUrl },
    data: { avatar: newUrl },
  });

  // For rich text fields, we need to fetch, replace, and update.
  // This is potentially slow but necessary for exact replacement.

  // Courses Description
  const coursesWithDesc = await db.course.findMany({
    where: { description: { contains: oldUrl } },
  });

  for (const course of coursesWithDesc) {
    const newDesc = course.description.replaceAll(oldUrl, newUrl);
    await db.course.update({
      where: { id: course.id },
      data: { description: newDesc },
    });
  }

  // Testimonials Content
  const testimonialsWithContent = await db.testimonial.findMany({
    where: { content: { contains: oldUrl } },
  });

  for (const testimonial of testimonialsWithContent) {
    const newContent = testimonial.content.replaceAll(oldUrl, newUrl);
    await db.testimonial.update({
      where: { id: testimonial.id },
      data: { content: newContent },
    });
  }

    // Contact Messages
    const contactsWithMessage = await db.contact.findMany({
        where: { message: { contains: oldUrl } }
    });

    for (const contact of contactsWithMessage) {
        const newMessage = contact.message.replaceAll(oldUrl, newUrl);
        await db.contact.update({
            where: { id: contact.id },
            data: { message: newMessage }
        })
    }
}
