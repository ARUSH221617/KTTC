// src/app/api/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

    // Clear admin session token cookie
    response.cookies.delete('admin_token');

    // For JWT-based sessions, clearing the cookie is sufficient
    // No server-side session store to clear
    clearAdminSession();

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}