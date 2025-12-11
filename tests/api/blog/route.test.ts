/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/admin/blog/route';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';

jest.mock('@/lib/db', () => ({
  db: {
    post: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

describe('Admin Blog API', () => {
  const mockAuth = auth as jest.Mock;
  const mockFindMany = db.post.findMany as jest.Mock;
  const mockCount = db.post.count as jest.Mock;
  const mockCreate = db.post.create as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns 401 if unauthorized', async () => {
      mockAuth.mockResolvedValue(null);
      const req = new NextRequest('http://localhost/api/admin/blog');
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    it('returns 200 and posts if authorized', async () => {
      mockAuth.mockResolvedValue({ user: { role: 'admin' } });
      mockFindMany.mockResolvedValue([{ id: '1', title: 'Post 1' }]);
      mockCount.mockResolvedValue(1);

      const req = new NextRequest('http://localhost/api/admin/blog');
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.posts).toHaveLength(1);
      expect(json.pagination.totalCount).toBe(1);
    });
  });

  describe('POST', () => {
    it('creates a post', async () => {
      mockAuth.mockResolvedValue({ user: { role: 'admin', id: 'user1' } });
      mockCreate.mockResolvedValue({ id: '1', title: 'New Post' });

      const req = new NextRequest('http://localhost/api/admin/blog', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Post',
          slug: 'new-post',
          content: 'Content',
        }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.title).toBe('New Post');
      expect(mockCreate).toHaveBeenCalled();
    });
  });
});
