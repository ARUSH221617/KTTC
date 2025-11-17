import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextApiRequest, NextApiResponse } from 'next';

export async function GET(request: NextApiRequest, response: NextApiResponse) {
  try {
    // Verify admin session
    const session = await auth(request, response);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { searchParams } = new URL(request.url!);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    // Get certificates with optional search
    const certificates = await db.certificate.findMany({
      where: {
        OR: [
          { userId: { contains: search, mode: 'insensitive' } },
          { courseId: { contains: search, mode: 'insensitive' } },
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
          { userId: { contains: search, mode: 'insensitive' } },
          { courseId: { contains: search, mode: 'insensitive' } },
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

export async function POST(request: NextApiRequest, response: NextApiResponse) {
  try {
    // Verify admin session
    const session = await auth(request, response);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.body;
    const { userId, courseId, issuedDate } = body;

    // Validate required fields
    if (!userId || !courseId) {
      return new Response(JSON.stringify({ error: 'User ID and Course ID are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create new certificate
    const newCertificate = await db.certificate.create({
      data: {
        userId,
        courseId,
        issuedDate: issuedDate ? new Date(issuedDate) : new Date(),
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

export async function PUT(request: NextApiRequest, response: NextApiResponse) {
  try {
    // Verify admin session
    const session = await auth(request,response);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.body;
    const { id, issuedDate } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Certificate ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update certificate
    const updatedCertificate = await db.certificate.update({
      where: { id },
      data: {
        issuedDate: issuedDate ? new Date(issuedDate) : undefined,
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

export async function DELETE(request: NextApiRequest, response: NextApiResponse) {
  try {
    // Verify admin session
    const session = await auth(request, response);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { searchParams } = new URL(request.url!);
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