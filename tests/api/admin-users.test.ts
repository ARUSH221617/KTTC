
/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

// Mock validateAdminSession
jest.mock('@/lib/auth', () => ({
  validateAdminSession: jest.fn(),
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

// Mock cookies
let mockCookiesGet = jest.fn();
jest.mock('next/headers', () => ({
  cookies: () => Promise.resolve({
    get: mockCookiesGet
  }),
}));

import { GET } from '@/app/api/admin/users/route';

describe('Admin Users API Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookiesGet.mockReset();
  });

  it('returns 401 if admin_token cookie is missing', async () => {
    mockCookiesGet.mockReturnValue(undefined);

    const req = new NextRequest('http://localhost:3000/api/admin/users');

    // @ts-ignore
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 401 if admin_token is invalid', async () => {
    mockCookiesGet.mockReturnValue({ value: 'invalid-token' });
    const { validateAdminSession } = require('@/lib/auth');
    validateAdminSession.mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/admin/users');

    // @ts-ignore
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 200 if admin_token is valid', async () => {
    mockCookiesGet.mockReturnValue({ value: 'valid-token' });
    const { validateAdminSession } = require('@/lib/auth');
    validateAdminSession.mockResolvedValue({ id: 'admin', role: 'admin' });

    const req = new NextRequest('http://localhost:3000/api/admin/users');

    // @ts-ignore
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});
