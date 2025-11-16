import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Handles POST requests to the /api/contact endpoint.
 *
 * @param {NextRequest} request - The incoming request.
 * @returns {Promise<NextResponse>} The response.
 */
export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Save contact message to database
    const contact = await db.contact.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Contact message saved successfully',
        id: contact.id 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handles GET requests to the /api/contact endpoint.
 *
 * @returns {Promise<NextResponse>} The response.
 */
export async function GET() {
  try {
    const contacts = await db.contact.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}