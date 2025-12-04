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
jest.mock('@/lib/auth', () => ({
  validateAdminSession: jest.fn().mockResolvedValue(true),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue({ value: 'valid_token' }),
  }),
}));

describe('POST /api/courses', () => {
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
    const data = await response.json();

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
    const data = await response.json();

    expect(response.status).toBe(201); // Expect success now
    expect(db.course.create).toHaveBeenCalled();
  });
});
