// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkAdminCredentials, createAdminSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check credentials
    const user = await checkAdminCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create response with success message
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, email: user.email } // Don't return sensitive info like password
    });

    // Create a secure admin session
    const sessionToken = createAdminSession(user.id, user.email);

    // Store the session token in a secure cookie
    response.cookies.set('admin_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
      sameSite: 'strict', // Prevent CSRF
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}