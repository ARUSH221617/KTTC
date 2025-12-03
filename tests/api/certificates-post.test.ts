
import { POST } from '@/app/api/admin/certificates/route';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

/**
 * @jest-environment node
 */

jest.mock('@/lib/db', () => ({
  db: {
    certificate: {
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

describe('POST /api/admin/certificates', () => {
  it('should create a certificate successfully', async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: 'admin-id' } });
    (db.certificate.create as jest.Mock).mockResolvedValue({
      id: 'cert-1',
      userId: 'user-1',
      courseId: 'course-1',
      status: 'valid',
    });

    const request = new Request('http://localhost:3000/api/admin/certificates', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user-1',
        courseId: 'course-1',
        status: 'valid',
      }),
    });

    const response = await POST(request, {});

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toEqual({
      id: 'cert-1',
      userId: 'user-1',
      courseId: 'course-1',
      status: 'valid',
    });

    expect(db.certificate.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        courseId: 'course-1',
        status: 'valid',
      },
    });
  });

  it('should handle unauthorized access', async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/admin/certificates', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request, {});
    expect(response.status).toBe(401);
  });
});
