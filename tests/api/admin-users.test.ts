
/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

// Mock auth
const mockAuth = jest.fn();
jest.mock('@/lib/auth', () => ({
  auth: (...args: any[]) => mockAuth(...args)
}));

// Mock db
jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    }
  }
}));

import { GET } from '@/app/api/admin/users/route';

describe('Admin Users API Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 if session is missing', async () => {
    mockAuth.mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/admin/users');

    // @ts-ignore
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 401 if user is not admin', async () => {
    mockAuth.mockResolvedValue({
        user: { id: 'user-id', role: 'user' }
    });

    const req = new NextRequest('http://localhost:3000/api/admin/users');

    // @ts-ignore
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 200 if user is admin', async () => {
    mockAuth.mockResolvedValue({
        user: { id: 'admin-id', role: 'admin' }
    });

    const req = new NextRequest('http://localhost:3000/api/admin/users');

    // @ts-ignore
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});
