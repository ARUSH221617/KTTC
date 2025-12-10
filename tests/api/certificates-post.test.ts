
import { POST } from '@/app/api/admin/certificates/route';
import { db } from '@/lib/db';

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

// Mock auth
const mockAuth = jest.fn();
jest.mock('@/lib/auth', () => ({
  auth: (...args: any[]) => mockAuth(...args)
}));

describe('POST /api/admin/certificates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a certificate successfully', async () => {
    // Setup authorized session
    mockAuth.mockResolvedValue({
        user: { id: 'admin-id', role: 'admin' }
    });

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

    // @ts-ignore
    const response = await POST(request);

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
    mockAuth.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/admin/certificates', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    // @ts-ignore
    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});
