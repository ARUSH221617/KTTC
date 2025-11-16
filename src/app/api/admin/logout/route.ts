// src/app/api/admin/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/auth';

/**
 * Handles admin logout.
 *
 * @param {NextRequest} request - The incoming request.
 * @returns {Promise<NextResponse>} The response.
 */
export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

    // Clear admin session token
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