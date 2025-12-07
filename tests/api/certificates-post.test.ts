
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

// Mock validateAdminSession
jest.mock('@/lib/auth', () => ({
  validateAdminSession: jest.fn(),
}));

// Mock cookies
let mockCookiesGet = jest.fn();
jest.mock('next/headers', () => ({
  cookies: () => Promise.resolve({
    get: mockCookiesGet
  }),
}));

describe('POST /api/admin/certificates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookiesGet.mockReset();
  });

  it('should create a certificate successfully', async () => {
    // Setup authorized session
    mockCookiesGet.mockReturnValue({ value: 'valid-token' });
    const { validateAdminSession } = require('@/lib/auth');
    validateAdminSession.mockResolvedValue({ id: 'admin-id', role: 'admin' });

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
    mockCookiesGet.mockReturnValue(undefined);

    const request = new Request('http://localhost:3000/api/admin/certificates', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    // @ts-ignore
    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});
