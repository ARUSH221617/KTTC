/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/testimonials/route';
import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

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
      { id: '1', name: 'John Doe', createdAt: new Date('2023-01-01') },
      { id: '2', name: 'Jane Smith', createdAt: new Date('2023-01-02') },
    ];

    (db.testimonial.findMany as jest.Mock).mockResolvedValue(mockTestimonials.reverse());

    const request = new NextRequest('http://localhost/api/testimonials');
    const response = await GET();
    const data = await response.json();

    expect(db.testimonial.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
    // Serialize dates to string to match JSON response
    const expected = JSON.parse(JSON.stringify(mockTestimonials));
    expect(data).toEqual(expected);
  });

  it('should return only the 6 most recent testimonials', async () => {
    (db.testimonial.findMany as jest.Mock).mockResolvedValue([]);

    await GET();

    expect(db.testimonial.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 6,
        orderBy: { createdAt: 'desc' },
      })
    );
  });
});

describe('POST /api/testimonials', () => {
  it('should create a new testimonial with valid data', async () => {
    const newTestimonial = {
      name: 'Alice',
      role: 'Developer',
      content: 'Great course!',
      avatar: 'avatar.png',
    };

    (db.testimonial.create as jest.Mock).mockResolvedValue({
      id: '3',
      ...newTestimonial,
      createdAt: new Date(),
    });

    const request = new NextRequest('http://localhost/api/testimonials', {
      method: 'POST',
      body: JSON.stringify(newTestimonial),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.testimonial.name).toBe(newTestimonial.name);
    expect(db.testimonial.create).toHaveBeenCalledWith({
      data: {
          ...newTestimonial,
          avatar: newTestimonial.avatar || null,
      },
    });
  });

  it('should return 400 if name is missing', async () => {
    const newTestimonial = {
      role: 'Developer',
      content: 'Great course!',
    };

    const request = new NextRequest('http://localhost/api/testimonials', {
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
      name: 'Alice',
      content: 'Great course!',
    };

    const request = new NextRequest('http://localhost/api/testimonials', {
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
      name: 'Alice',
      role: 'Developer',
    };

    const request = new NextRequest('http://localhost/api/testimonials', {
      method: 'POST',
      body: JSON.stringify(newTestimonial),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Name, role, and content are required');
  });
});
