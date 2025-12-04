// src/app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkAdminCredentials, createAdminSession } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

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
    const sessionToken = await createAdminSession(user.id, user.email);

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
