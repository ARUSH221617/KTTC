import { GET, POST } from '@/app/api/testimonials/route';
import { db } from '@/lib/db';
import { NextRequest } from 'next/server';
import { NextURL } from 'next/dist/server/web/next-url';

// Mock the db
jest.mock('@/lib/db', () => ({
  db: {
    testimonial: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('GET /api/testimonials', () => {
  it('should return testimonials sorted by createdAt in descending order', async () => {
    const mockTestimonials = [
      { id: '1', name: 'John Doe', role: 'Developer', content: 'Great!', createdAt: new Date('2023-01-01') },
      { id: '2', name: 'Jane Doe', role: 'Designer', content: 'Awesome!', createdAt: new Date('2023-01-02') },
    ];

    (db.testimonial.findMany as jest.Mock).mockResolvedValue(mockTestimonials.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));

    const response = await GET();
    const data = await response.json();

    expect(db.testimonial.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });

    expect(data).toEqual([
      { id: '2', name: 'Jane Doe', role: 'Designer', content: 'Awesome!', createdAt: '2023-01-02T00:00:00.000Z' },
      { id: '1', name: 'John Doe', role: 'Developer', content: 'Great!', createdAt: '2023-01-01T00:00:00.000Z' },
    ]);
  });
});

describe('POST /api/testimonials', () => {
  it('should create a new testimonial with valid data', async () => {
    const newTestimonial = {
      name: 'Test User',
      role: 'Tester',
      content: 'This is a test.',
    };
    const createdTestimonial = { id: '3', ...newTestimonial, createdAt: new Date() };

    (db.testimonial.create as jest.Mock).mockResolvedValue(createdTestimonial);

    const url = new NextURL('http://localhost/api/testimonials');
    const request = new NextRequest(url, {
      method: 'POST',
      body: JSON.stringify(newTestimonial),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.testimonial.name).toBe(newTestimonial.name);
    expect(db.testimonial.create).toHaveBeenCalledWith({
      data: {
        name: newTestimonial.name,
        role: newTestimonial.role,
        content: newTestimonial.content,
        avatar: null,
      },
    });
  });

  it('should return 400 if name is missing', async () => {
    const newTestimonial = {
      role: 'Tester',
      content: 'This is a test.',
    };

    const url = new NextURL('http://localhost/api/testimonials');
    const request = new NextRequest(url, {
      method: 'POST',
      body: JSON.stringify(newTestimonial),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Name, role, and content are required');
  });

  it('should return 400 if role is missing', async () => {
    const newTestimonial = {
      name: 'Test User',
      content: 'This is a test.',
    };

    const url = new NextURL('http://localhost/api/testimonials');
    const request = new NextRequest(url, {
      method: 'POST',
      body: JSON.stringify(newTestimonial),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Name, role, and content are required');
  });

  it('should return 400 if content is missing', async () => {
    const newTestimonial = {
      name: 'Test User',
      role: 'Tester',
    };

    const url = new NextURL('http://localhost/api/testimonials');
    const request = new NextRequest(url, {
      method: 'POST',
      body: JSON.stringify(newTestimonial),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Name, role, and content are required');
  });
});
