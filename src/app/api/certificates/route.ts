import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { publicCertificateSchema, publicCertificateUpdateSchema } from '@/lib/validations-public';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const certificateNo = searchParams.get('certificateNo');

    if (certificateNo) {
      // Verify specific certificate
      const certificate = await db.certificate.findUnique({
        where: { certificateNo },
        include: {
          user: true,
          course: {
            include: {
              instructor: true
            }
          }
        }
      });

      if (!certificate) {
        return NextResponse.json(
          { 
            isValid: false, 
            error: 'Certificate not found' 
          },
          { status: 404 }
        );
      }

      // Check status field (schema update)
      const isValid = certificate.status === 'valid';

      if (!isValid) {
        return NextResponse.json(
          { 
            isValid: false, 
            error: 'Certificate has been revoked' 
          },
          { status: 200 }
        );
      }

      return NextResponse.json({
        isValid: true,
        certificate: {
          holderName: certificate.user.name,
          courseTitle: certificate.course.title,
          instructorName: certificate.course.instructor.name,
          issueDate: certificate.createdAt,
          certificateId: certificate.certificateNo,
          status: certificate.status,
        }
      });
    } else {
      // Get all certificates (admin use)
      const certificates = await db.certificate.findMany({
        include: {
          user: true,
          course: {
            include: {
              instructor: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Map to a friendlier format if needed, or return as is
      return NextResponse.json(certificates);
    }
  } catch (error) {
    console.error('Error verifying certificate:', error);
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

    const result = publicCertificateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const { certificateNo, userId, courseId, status } = result.data;

    // Check if certificate number already exists
    const existingCertificate = await db.certificate.findUnique({
      where: { certificateNo }
    });

    if (existingCertificate) {
      return NextResponse.json(
        { error: 'Certificate number already exists' },
        { status: 400 }
      );
    }

    // Verify course exists
    const course = await db.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Verify user exists (optional but recommended)
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create new certificate
    const certificate = await db.certificate.create({
      data: {
        certificateNo,
        userId,
        courseId,
        status: status || 'valid',
      },
      include: {
        user: true,
        course: {
          include: {
            instructor: true
          }
        }
      }
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Certificate created successfully',
        certificate 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating certificate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const result = publicCertificateUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const { certificateNo, status } = result.data;

    // Update certificate status
    const certificate = await db.certificate.update({
      where: { certificateNo },
      data: { status },
      include: {
        user: true,
        course: {
          include: {
            instructor: true
          }
        }
      }
    });

    return NextResponse.json(
      { 
        success: true, 
        message: `Certificate status updated to ${status} successfully`,
        certificate 
      }
    );

  } catch (error) {
    console.error('Error updating certificate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
