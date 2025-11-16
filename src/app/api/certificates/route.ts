import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Handles GET requests to the /api/certificates endpoint.
 *
 * @param {NextRequest} request - The incoming request.
 * @returns {Promise<NextResponse>} The response.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const certificateNo = searchParams.get('certificateNo');

    if (certificateNo) {
      // Verify specific certificate
      const certificate = await db.certificate.findUnique({
        where: { certificateNo },
        include: {
          course: {
            select: {
              title: true,
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

      if (!certificate.isValid) {
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
          holderName: certificate.holderName,
          courseTitle: certificate.course.title,
          instructorName: certificate.course.instructor,
          issueDate: certificate.issueDate,
          certificateId: certificate.certificateNo,
          // Add additional fields as needed
        }
      });
    } else {
      // Get all certificates (admin use)
      const certificates = await db.certificate.findMany({
        include: {
          course: {
            select: {
              title: true,
              instructor: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

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

/**
 * Handles POST requests to create a new certificate.
 *
 * @param {NextRequest} request - The incoming request containing certificate data.
 * @returns {Promise<NextResponse>} The response indicating success or failure.
 */
export async function POST(request: NextRequest) {
  try {
    const { certificateNo, holderName, courseId, issueDate } = await request.json();

    // Validate required fields
    if (!certificateNo || !holderName || !courseId || !issueDate) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

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

    // Create new certificate
    const certificate = await db.certificate.create({
      data: {
        certificateNo,
        holderName,
        courseId,
        issueDate: new Date(issueDate),
      },
      include: {
        course: {
          select: {
            title: true,
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

/**
 * Handles PUT requests to update a certificate's validity.
 *
 * @param {NextRequest} request - The incoming request containing certificate number and validity.
 * @returns {Promise<NextResponse>} The response indicating success or failure.
 */
export async function PUT(request: NextRequest) {
  try {
    const { certificateNo, isValid } = await request.json();

    if (!certificateNo) {
      return NextResponse.json(
        { error: 'Certificate number is required' },
        { status: 400 }
      );
    }

    // Update certificate validity
    const certificate = await db.certificate.update({
      where: { certificateNo },
      data: { isValid },
      include: {
        course: {
          select: {
            title: true,
            instructor: true
          }
        }
      }
    });

    return NextResponse.json(
      { 
        success: true, 
        message: `Certificate ${isValid ? 'activated' : 'revoked'} successfully`,
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