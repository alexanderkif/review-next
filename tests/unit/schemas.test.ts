import { describe, expect, it } from 'vitest';
import {
  AdminCVUpdateSchema,
  ChatRequestSchema,
  CommentCreateRequestSchema,
  CommentUpdateRequestSchema,
  ImageUploadSchema,
  LoginSchema,
  NumericIdParamsSchema,
  ProjectCreateSchema,
  ProjectUpdateSchema,
  RegisterRequestSchema,
  ResendVerificationRequestSchema,
  VerificationTokenQuerySchema,
  validate,
} from '@/types/schemas';

const validProject = {
  title: 'Portfolio',
  description: 'Project description',
  short_description: 'Short description',
  technologies: ['React'],
  year: 2026,
  featured: false,
};

describe('authentication schemas', () => {
  it('accepts a valid registration request', () => {
    expect(
      RegisterRequestSchema.safeParse({
        name: 'Alex',
        email: 'alex@example.com',
        password: 'secure-password',
      }).success,
    ).toBe(true);
  });

  it.each([
    [{ name: '', email: 'alex@example.com', password: 'secure-password' }],
    [{ name: 'x'.repeat(256), email: 'alex@example.com', password: 'secure-password' }],
    [{ name: 'Alex', email: 'not-an-email', password: 'secure-password' }],
    [{ name: 'Alex', email: 'alex@example.com', password: '123' }],
  ])('rejects invalid registration data: %o', (data) => {
    expect(RegisterRequestSchema.safeParse(data).success).toBe(false);
  });

  it('accepts and rejects resend verification email input', () => {
    expect(ResendVerificationRequestSchema.safeParse({ email: 'a@example.com' }).success).toBe(
      true,
    );
    expect(ResendVerificationRequestSchema.safeParse({ email: 'bad' }).success).toBe(false);
  });

  it('validates login email and password', () => {
    expect(LoginSchema.safeParse({ email: 'a@example.com', password: '123456' }).success).toBe(
      true,
    );
    expect(LoginSchema.safeParse({ email: 'bad', password: '123456' }).success).toBe(false);
    expect(LoginSchema.safeParse({ email: 'a@example.com', password: '123' }).success).toBe(false);
  });
});

describe('project schemas', () => {
  it('accepts valid project data and applies defaults', () => {
    expect(ProjectCreateSchema.parse(validProject)).toMatchObject({
      status: 'completed',
      hidden: false,
      featured: false,
    });
  });

  it.each([
    [{ ...validProject, github_url: 'not-a-url' }],
    [{ ...validProject, year: 1999 }],
    [{ ...validProject, year: 2031 }],
    [{ ...validProject, status: 'unknown' }],
    [{ ...validProject, technologies: 'React' }],
    [{ ...validProject, title: '' }],
  ])('rejects invalid project data: %o', (data) => {
    expect(ProjectCreateSchema.safeParse(data).success).toBe(false);
  });

  it('requires an id for project updates and accepts partial fields', () => {
    expect(ProjectUpdateSchema.safeParse({ id: 1, title: 'Updated' }).success).toBe(true);
    expect(ProjectUpdateSchema.safeParse({ title: 'Missing ID' }).success).toBe(false);
  });
});

describe('comment and route parameter schemas', () => {
  it('validates comment content and size limits', () => {
    expect(CommentCreateRequestSchema.safeParse({ project_id: 1, content: 'hello' }).success).toBe(
      true,
    );
    expect(CommentCreateRequestSchema.safeParse({ project_id: 1, content: '' }).success).toBe(
      false,
    );
    expect(
      CommentCreateRequestSchema.safeParse({ project_id: 1, content: 'x'.repeat(1001) }).success,
    ).toBe(false);
    expect(CommentUpdateRequestSchema.safeParse({ content: 'updated' }).success).toBe(true);
    expect(CommentUpdateRequestSchema.safeParse({ content: 'x'.repeat(1001) }).success).toBe(false);
  });

  it('accepts only positive integer route IDs', () => {
    expect(NumericIdParamsSchema.safeParse({ id: '12' }).success).toBe(true);
    for (const id of ['0', '-1', '1.5', 'not-an-id']) {
      expect(NumericIdParamsSchema.safeParse({ id }).success).toBe(false);
    }
  });

  it('validates verification tokens', () => {
    expect(VerificationTokenQuerySchema.safeParse({ token: 'abc123' }).success).toBe(true);
    expect(VerificationTokenQuerySchema.safeParse({ token: '' }).success).toBe(false);
    expect(VerificationTokenQuerySchema.safeParse({ token: 'x'.repeat(513) }).success).toBe(false);
  });
});

describe('other API schemas', () => {
  it('validates a minimally valid admin CV update', () => {
    expect(AdminCVUpdateSchema.safeParse({ id: '1', email: 'a@example.com' }).success).toBe(true);
    expect(AdminCVUpdateSchema.safeParse({ id: '0' }).success).toBe(false);
    expect(AdminCVUpdateSchema.safeParse({ id: '1', email: 'bad' }).success).toBe(false);
  });

  it('validates image upload payloads and base64 limits', () => {
    const valid = {
      entityType: 'project',
      entityId: '1',
      imageData: 'data:image/png;base64,AA==',
      mimeType: 'image/png',
    };
    expect(ImageUploadSchema.safeParse(valid).success).toBe(true);
    expect(ImageUploadSchema.safeParse({ ...valid, mimeType: 'image/svg+xml' }).success).toBe(
      false,
    );
    expect(ImageUploadSchema.safeParse({ ...valid, imageData: 'not-a-data-url' }).success).toBe(
      false,
    );
  });

  it('trims and bounds chat messages', () => {
    expect(ChatRequestSchema.parse({ messages: [{ role: 'user', content: '  hi  ' }] })).toEqual({
      messages: [{ role: 'user', content: 'hi' }],
    });
    expect(
      ChatRequestSchema.parse({ messages: [{ role: 'user', content: 'x'.repeat(700) }] }),
    ).toMatchObject({ messages: [{ content: 'x'.repeat(600) }] });
    expect(ChatRequestSchema.safeParse({ messages: [] }).success).toBe(false);
  });

  it('returns a discriminated result from validate', () => {
    expect(validate(LoginSchema, { email: 'a@example.com', password: '123456' }).success).toBe(
      true,
    );
    expect(validate(LoginSchema, { email: 'bad', password: '123456' }).success).toBe(false);
  });
});
