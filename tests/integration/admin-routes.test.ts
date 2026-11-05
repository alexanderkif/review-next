// @vitest-environment node
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  sql: vi.fn(),
  verifyAdminAuth: vi.fn(),
  revalidateCVData: vi.fn(),
}));

vi.mock('@/lib/db', () => ({ sql: mocks.sql }));
vi.mock('@/lib/admin-auth', () => ({ verifyAdminAuth: mocks.verifyAdminAuth }));
vi.mock('@/lib/cv-service', () => ({ revalidateCVData: mocks.revalidateCVData }));

import { GET, POST } from '@/api/admin/projects/route';
import { GET as getAdminCV } from '@/api/admin/cv/route';

describe('admin route authorization', () => {
  beforeEach(() => {
    mocks.sql.mockReset().mockResolvedValue([]);
    mocks.verifyAdminAuth.mockReset().mockResolvedValue({ isAdmin: false });
    mocks.revalidateCVData.mockReset().mockResolvedValue(undefined);
  });

  it('rejects unauthenticated project listing without querying the database', async () => {
    const response = await GET();

    expect(response.status).toBe(401);
    expect(mocks.sql).not.toHaveBeenCalled();
  });

  it('rejects non-admin project creation without a database mutation', async () => {
    const request = new NextRequest('http://localhost/api/admin/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Forbidden' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(mocks.sql).not.toHaveBeenCalled();
  });

  it('rejects invalid project data before issuing SQL', async () => {
    mocks.verifyAdminAuth.mockResolvedValue({ isAdmin: true });
    const request = new NextRequest('http://localhost/api/admin/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mocks.sql).not.toHaveBeenCalled();
  });

  it('returns projects to admins', async () => {
    const projects = [{ id: 1, title: 'Test project' }];
    mocks.verifyAdminAuth.mockResolvedValue({ isAdmin: true });
    mocks.sql.mockResolvedValueOnce(projects);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(projects);
  });

  it('creates a project and revalidates cached CV data for admins', async () => {
    const project = { id: 4, title: 'Test project' };
    mocks.verifyAdminAuth.mockResolvedValue({ isAdmin: true });
    mocks.sql.mockResolvedValueOnce([project]);
    const request = new NextRequest('http://localhost/api/admin/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test project',
        description: 'Description',
        short_description: 'Short',
        technologies: ['React'],
        year: 2026,
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(project);
    expect(mocks.revalidateCVData).toHaveBeenCalledOnce();
  });

  it('rejects non-admin CV access', async () => {
    const response = await getAdminCV();

    expect(response.status).toBe(401);
    expect(mocks.sql).not.toHaveBeenCalled();
  });
});
