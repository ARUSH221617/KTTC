
/** @jest-environment node */
import { GET } from '@/app/api/certificates/route';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/db', () => ({
  db: {
    certificate: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    course: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

describe('GET /api/certificates', () => {
  it('should return 401 when listing all certificates without authentication', async () => {
    // Setup mock to return null session
    const { auth } = require('@/lib/auth');
    auth.mockResolvedValue(null);

    // Create a request without certificateNo param
    const request = new NextRequest('http://localhost:3000/api/certificates');

    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('should return 401 when listing all certificates as non-admin', async () => {
    // Setup mock to return user session
    const { auth } = require('@/lib/auth');
    auth.mockResolvedValue({ user: { id: 'user1', role: 'student' } });

    // Create a request without certificateNo param
    const request = new NextRequest('http://localhost:3000/api/certificates');

    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('should allow listing all certificates as admin', async () => {
    // Setup mock to return admin session
    const { auth } = require('@/lib/auth');
    auth.mockResolvedValue({ user: { id: 'admin1', role: 'admin' } });

    const { db } = require('@/lib/db');
    db.certificate.findMany.mockResolvedValue([
      { id: '1', certificateNo: 'CERT-123', status: 'valid' }
    ]);

    // Create a request without certificateNo param
    const request = new NextRequest('http://localhost:3000/api/certificates');

    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveLength(1);
  });

  it('should allow public verification with certificateNo without authentication', async () => {
    const { auth } = require('@/lib/auth');
    auth.mockResolvedValue(null);

    const { db } = require('@/lib/db');
    db.certificate.findUnique.mockResolvedValue({
        certificateNo: 'CERT-PUBLIC',
        status: 'valid',
        user: { name: 'John Doe' },
        course: { title: 'Course 1', instructor: { name: 'Instructor 1' } },
        createdAt: new Date()
    });

    const request = new NextRequest('http://localhost:3000/api/certificates?certificateNo=CERT-PUBLIC');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.isValid).toBe(true);
  });
});
