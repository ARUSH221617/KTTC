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

describe('POST /api/courses', () => {
  it('should return 400 if thumbnail is missing', async () => {
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

    expect(response.status).toBe(400);
    expect(data.error).toBe('All required fields must be provided');
    expect(db.course.create).not.toHaveBeenCalled();
  });

  it('should return 400 if thumbnail is empty string', async () => {
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

    expect(response.status).toBe(400);
    expect(data.error).toBe('All required fields must be provided');
    expect(db.course.create).not.toHaveBeenCalled();
  });
});
