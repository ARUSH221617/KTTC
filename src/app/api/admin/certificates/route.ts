import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateAdminSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import { certificateSchema, certificateUpdateSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token')?.value;

    if (!adminToken || !(await validateAdminSession(adminToken))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    // Get certificates with optional search
    const certificates = await db.certificate.findMany({
      where: {
        OR: [
          { userId: { contains: search } },
          { courseId: { contains: search } },
          { certificateNo: { contains: search } },
        ],
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        course: true,
      },
    });

    // Get total count for pagination
    const totalCount = await db.certificate.count({
      where: {
        OR: [
          { userId: { contains: search } },
          { courseId: { contains: search } },
          { certificateNo: { contains: search } },
        ],
      },
    });
    
    return new Response(
      JSON.stringify({
        certificates,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch certificates' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token')?.value;

    if (!adminToken || !(await validateAdminSession(adminToken))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const result = certificateSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: result.error.format() }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { userId, courseId, status } = result.data;

    // Create new certificate
    const newCertificate = await db.certificate.create({
      data: {
        userId,
        courseId,
        status: status || 'valid',
      },
    });

    return new Response(JSON.stringify(newCertificate), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating certificate:', error);
    return new Response(JSON.stringify({ error: 'Failed to create certificate' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin session
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token')?.value;

    if (!adminToken || !(await validateAdminSession(adminToken))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const result = certificateUpdateSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: result.error.format() }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { id, status } = result.data;

    // Update certificate
    const updatedCertificate = await db.certificate.update({
      where: { id },
      data: {
        status: status || undefined,
      },
    });

    return new Response(JSON.stringify(updatedCertificate), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating certificate:', error);
    return new Response(JSON.stringify({ error: 'Failed to update certificate' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin session
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token')?.value;

    if (!adminToken || !(await validateAdminSession(adminToken))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Certificate ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete certificate
    await db.certificate.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ message: 'Certificate deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete certificate' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}