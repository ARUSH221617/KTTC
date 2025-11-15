// src/app/api/admin/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get the token from the cookie
    const token = request.cookies.get('admin_token');

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

    // Clear admin session from memory if it exists
    if (token?.value) {
      clearAdminSession(token.value);
    }

    // Clear admin session token cookie
    response.cookies.delete('admin_token');

    return response;
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}