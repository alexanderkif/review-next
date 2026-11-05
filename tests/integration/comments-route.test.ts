// @vitest-environment node
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  sql: vi.fn(),
  auth: vi.fn(),
  verifyAdminAuth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({ sql: mocks.sql }));
vi.mock('@/lib/auth', () => ({ auth: mocks.auth }));
vi.mock('@/lib/admin-auth', () => ({ verifyAdminAuth: mocks.verifyAdminAuth }));

import { DELETE, PUT } from '@/api/comments/[id]/route';

const context = { params: Promise.resolve({ id: '5' }) };

function updateRequest(content = 'updated comment') {
  return new NextRequest('http://localhost/api/comments/5', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
}

describe('comment ownership routes', () => {
  beforeEach(() => {
    mocks.sql.mockReset().mockResolvedValue([]);
    mocks.auth.mockReset().mockResolvedValue({ user: { id: '7' } });
    mocks.verifyAdminAuth.mockReset().mockResolvedValue({ isAdmin: false });
  });

  it('requires an authenticated user before querying a comment', async () => {
    mocks.auth.mockResolvedValueOnce(null);

    const response = await PUT(updateRequest(), context);

    expect(response.status).toBe(401);
    expect(mocks.sql).not.toHaveBeenCalled();
  });

  it('rejects invalid route IDs before querying the database', async () => {
    const response = await PUT(updateRequest(), {
      params: Promise.resolve({ id: 'invalid' }),
    });

    expect(response.status).toBe(400);
    expect(mocks.sql).not.toHaveBeenCalled();
  });

  it('rejects invalid update data before querying the database', async () => {
    const response = await PUT(updateRequest(''), context);

    expect(response.status).toBe(400);
    expect(mocks.sql).not.toHaveBeenCalled();
  });

  it('allows the comment owner to edit their comment', async () => {
    mocks.sql
      .mockResolvedValueOnce([{ user_id: 7 }])
      .mockResolvedValueOnce([{ id: 5, content: 'updated comment' }]);

    const response = await PUT(updateRequest(), context);

    expect(response.status).toBe(200);
    expect(mocks.sql).toHaveBeenCalledTimes(2);
  });

  it('rejects another user from editing a comment', async () => {
    mocks.sql.mockResolvedValueOnce([{ user_id: 8 }]);

    const response = await PUT(updateRequest(), context);

    expect(response.status).toBe(403);
    expect(mocks.sql).toHaveBeenCalledOnce();
  });

  it('allows an admin to edit another user comment', async () => {
    mocks.sql
      .mockResolvedValueOnce([{ user_id: 8 }])
      .mockResolvedValueOnce([{ id: 5, content: 'updated comment' }]);
    mocks.verifyAdminAuth.mockResolvedValueOnce({ isAdmin: true });

    const response = await PUT(updateRequest(), context);

    expect(response.status).toBe(200);
    expect(mocks.sql).toHaveBeenCalledTimes(2);
  });

  it('allows an owner to delete their comment', async () => {
    mocks.sql.mockResolvedValueOnce([{ user_id: 7 }]).mockResolvedValueOnce([]);

    const response = await DELETE(
      new NextRequest('http://localhost/api/comments/5', { method: 'DELETE' }),
      context,
    );

    expect(response.status).toBe(200);
    expect(mocks.sql).toHaveBeenCalledTimes(2);
  });
});
