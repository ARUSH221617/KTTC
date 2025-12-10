import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const session = await auth();

    if (!session?.user?.id || (session.user.role !== 'admin' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get dashboard statistics
    const [
      totalUsers,
      totalCourses,
      totalCertificates,
      recentUsers,
      recentCourses
    ] = await Promise.all([
      db.user.count(),
      db.course.count(),
      db.certificate.count(),
      db.user.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, createdAt: true }
      }),
      db.course.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, instructor: { select: { name: true } }, createdAt: true }
      })
    ]);

    return new Response(
      JSON.stringify({
        stats: {
          totalUsers,
          totalCourses,
          totalCertificates,
        },
        recent: {
          users: recentUsers,
          courses: recentCourses,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch dashboard data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}