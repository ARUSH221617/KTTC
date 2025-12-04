/**
 * @jest-environment node
 */
import { GET } from '@/app/api/courses/route';
import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

// Mock the db
jest.mock('@/lib/db', () => ({
  db: {
    course: {
      findMany: jest.fn(),
    },
  },
}));

// Mock authentication
jest.mock('@/lib/auth', () => ({
  validateAdminSession: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('GET /api/courses', () => {
  it('should sort courses by popularity in descending order', async () => {
    const mockCourses = [
      { id: '1', title: 'Course A', popularity: 10 },
      { id: '2', title: 'Course B', popularity: 30 },
      { id: '3', title: 'Course C', popularity: 20 },
    ];

    (db.course.findMany as jest.Mock).mockResolvedValue(mockCourses.sort((a, b) => b.popularity - a.popularity));

    // Construct the URL string directly
    const url = 'http://localhost/api/courses?sortBy=popularity';
    const request = new NextRequest(url);

    const response = await GET(request);
    const data = await response.json();

    expect(db.course.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { popularity: 'desc' },
      include: {
        instructor: {
            select: {
                name: true
            }
        }
      }
    });

    expect(data).toEqual([
        { id: '2', title: 'Course B', popularity: 30 },
        { id: '3', title: 'Course C', popularity: 20 },
        { id: '1', title: 'Course A', popularity: 10 },
    ]);
  });
});
