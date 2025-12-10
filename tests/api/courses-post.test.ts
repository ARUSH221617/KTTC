/**
 * @jest-environment node
 */
import { POST } from '@/app/api/courses/route';
import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

// Mock the db
jest.mock('@/lib/db', () => ({
  db: {
    course: {
      create: jest.fn(),
    },
  },
}));

// Mock authentication
const mockAuth = jest.fn();
jest.mock('@/lib/auth', () => ({
  auth: (...args: any[]) => mockAuth(...args)
}));

describe('POST /api/courses', () => {

  beforeEach(() => {
    mockAuth.mockResolvedValue({ user: { id: 'admin', role: 'admin' } });
  });

  it('should create course even if thumbnail is missing (optional now)', async () => {
    const body = {
      title: 'New Course',
      description: 'Course Description',
      category: 'Development',
      level: 'Beginner',
      duration: '10h',
      instructorId: 'inst123',
      // thumbnail is missing
    };

    const request = new NextRequest('http://localhost/api/courses', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const response = await POST(request);

    expect(response.status).toBe(201); // Expect success now
    expect(db.course.create).toHaveBeenCalled();
  });

  it('should create course even if thumbnail is empty string', async () => {
    const body = {
      title: 'New Course',
      description: 'Course Description',
      category: 'Development',
      level: 'Beginner',
      duration: '10h',
      instructorId: 'inst123',
      thumbnail: '',
    };

    const request = new NextRequest('http://localhost/api/courses', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const response = await POST(request);

    expect(response.status).toBe(201); // Expect success now
    expect(db.course.create).toHaveBeenCalled();
  });
});
