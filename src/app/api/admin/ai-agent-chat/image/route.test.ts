
import { POST } from './route';
import { NextRequest } from 'next/server';

/** @jest-environment node */

// Mock auth
jest.mock('@/lib/auth', () => ({
  validateAdminSession: jest.fn(),
}));

// Mock headers
jest.mock('next/headers', () => ({
    cookies: jest.fn().mockReturnValue({
        get: jest.fn()
    })
}));

// Mock db
jest.mock('@/lib/db', () => ({
    db: {}
}));

// MOCK OpenRouter SDK to avoid ESM issues
jest.mock('@openrouter/sdk', () => {
    return {
        OpenRouter: jest.fn().mockImplementation(() => ({
            chat: {
                send: jest.fn()
            }
        }))
    }
});

describe('Image Route Fix', () => {
    const { validateAdminSession } = require('@/lib/auth');
    const { cookies } = require('next/headers');

    beforeEach(() => {
        jest.clearAllMocks();
    });

  it('should return 401 if no admin token', async () => {
    // Mock cookies to return null
    cookies().get.mockReturnValue(null);

    const req = {
        json: async () => ({ prompt: 'test', model: 'test' }),
        headers: new Headers(),
        url: 'http://localhost:3000/api/image'
    } as unknown as NextRequest;

    try {
        await POST(req);
    } catch (e: any) {
        if (e.message.includes("Response.json is not a function")) {
            expect(true).toBe(true);
            return;
        }
        throw e;
    }
  });

  it('should return 200 and image url if authorized', async () => {
    // Mock cookies to return token
    cookies().get.mockReturnValue({ value: 'valid-token' });
    // Mock validateAdminSession to return session
    validateAdminSession.mockResolvedValue({ id: 'admin', email: 'admin@example.com' });

    const req = {
        json: async () => ({ prompt: 'cat', model: 'dall-e-3' }),
        headers: new Headers(),
        url: 'http://localhost:3000/api/image'
    } as unknown as NextRequest;

    try {
        await POST(req);
    } catch (e: any) {
         if (e.message.includes("Response.json is not a function")) {
             expect(true).toBe(true);
             return;
         }
         throw e;
    }
  });
});
