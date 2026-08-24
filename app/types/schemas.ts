// Zod validation schemas for the entire application
import { z } from 'zod';

// ==================== Auth Schemas ====================

export const LoginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type LoginData = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type RegisterData = z.infer<typeof RegisterSchema>;

// ==================== Comment Schemas ====================

export const CommentSchema = z.object({
  projectId: z.number(),
  comment: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
});

export type CommentData = z.infer<typeof CommentSchema>;

// ==================== Project Schemas ====================

export const ProjectCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  short_description: z.string().min(1, 'Short description is required'),
  technologies: z.array(z.string()),
  github_url: z.string().url().optional().or(z.literal('')).nullable(),
  demo_url: z.string().url().optional().or(z.literal('')).nullable(),
  image_urls: z.array(z.string()).optional(),
  year: z.number().min(2000).max(2030),
  featured: z.boolean().default(false),
  status: z.enum(['completed', 'in-progress', 'archived']).default('completed'),
});

export type ProjectCreateData = z.infer<typeof ProjectCreateSchema>;

export const ProjectUpdateSchema = ProjectCreateSchema.partial().merge(
  z.object({ id: z.number() }),
);

export type ProjectUpdateData = z.infer<typeof ProjectUpdateSchema>;

// ==================== CV Schemas ====================

export const PersonalInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')).nullable(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
});

export type PersonalInfoData = z.infer<typeof PersonalInfoSchema>;

export const ExperienceSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  period: z.string().min(1, 'Period is required'),
  description: z.string().min(1, 'Description is required'),
  current: z.boolean().default(false),
});

export type ExperienceData = z.infer<typeof ExperienceSchema>;

export const EducationSchema = z.object({
  id: z.number().optional(),
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().min(1, 'Institution is required'),
  period: z.string().min(1, 'Period is required'),
  description: z.string().optional(),
});

export type EducationData = z.infer<typeof EducationSchema>;

export const LanguageSchema = z.object({
  id: z.number().optional(),
  language: z.string().min(1, 'Language is required'),
  level: z.string().min(1, 'Level is required'),
});

export type LanguageData = z.infer<typeof LanguageSchema>;

export const CVUpdateSchema = z.object({
  personalInfo: PersonalInfoSchema.optional(),
  about: z.string().optional(),
  skills: z.object({
    frontend: z.array(z.string()).optional(),
    backend: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
  }).optional(),
});

export type CVUpdateData = z.infer<typeof CVUpdateSchema>;

// ==================== Image Schemas ====================

export const ImageUploadSchema = z.object({
  entityType: z.enum(['avatar', 'project', 'user']),
  entityId: z.string().min(1, 'Entity ID is required'),
  imageData: z.string().min(1, 'Image data is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  width: z.number().optional(),
  height: z.number().optional(),
});

export type ImageUploadData = z.infer<typeof ImageUploadSchema>;

// ==================== Comment API Schemas ====================

export const CommentCreateRequestSchema = z.object({
  project_id: z.number(),
  content: z.string().min(1, 'Content is required').max(1000, 'Content is too long'),
});

export type CommentCreateRequestData = z.infer<typeof CommentCreateRequestSchema>;

export const CommentUpdateRequestSchema = z.object({
  content: z.string().min(1, 'Content is required').max(1000, 'Content is too long'),
});

export type CommentUpdateRequestData = z.infer<typeof CommentUpdateRequestSchema>;

// ==================== Image Reassign Schemas ====================

export const ImageReassignSchema = z.object({
  entityType: z.enum(['avatar', 'project', 'user']),
  oldEntityId: z.string().min(1, 'Old entity ID is required'),
  newEntityId: z.string().min(1, 'New entity ID is required'),
  imageIds: z.array(z.string()).min(1, 'At least one image ID is required'),
});

export type ImageReassignData = z.infer<typeof ImageReassignSchema>;

// ==================== Setup Schemas ====================

export const SetupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type SetupData = z.infer<typeof SetupSchema>;

// ==================== Profile Update Schemas ====================

export const UpdateProfileNameSchema = z.object({
  action: z.literal('update_name'),
  name: z.string().min(1, 'Name is required'),
});

export type UpdateProfileNameData = z.infer<typeof UpdateProfileNameSchema>;

export const UpdateProfileEmailSchema = z.object({
  action: z.literal('update_email'),
  email: z.string().email('Enter a valid email'),
});

export type UpdateProfileEmailData = z.infer<typeof UpdateProfileEmailSchema>;

export const UpdateProfilePasswordSchema = z.object({
  action: z.literal('update_password'),
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});

export type UpdateProfilePasswordData = z.infer<typeof UpdateProfilePasswordSchema>;

// Discriminated union covering all profile-update actions.
export const ProfileUpdateSchema = z.union([
  UpdateProfileNameSchema,
  UpdateProfileEmailSchema,
  UpdateProfilePasswordSchema,
]);

export type ProfileUpdateData = z.infer<typeof ProfileUpdateSchema>;

// ==================== Validation Utilities ====================

/**
 * Валидирует данные и возвращает результат валидации
 */
export function validate<T extends z.ZodType>(schema: T, data: unknown) {
  return schema.safeParse(data);
}

/**
 * Валидирует данные FormData (для server actions)
 */
export function validateFormData<T extends z.ZodType>(
  schema: T,
  formData: FormData,
) {
  const data: Record<string, unknown> = {};
  
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') {
      // Пытаемся парсить числа и boolean
      if (value === 'true') data[key] = true;
      else if (value === 'false') data[key] = false;
      else if (!isNaN(Number(value)) && value.trim() !== '') data[key] = Number(value);
      else data[key] = value;
    }
  }
  
  return schema.safeParse(data);
}

/**
 * Извлекает ошибки валидации в удобном формате
 */
export function getValidationErrors(error: z.ZodError): Record<string, string[]> {
  const flattened = error.flatten();
  return flattened.fieldErrors as Record<string, string[]>;
}

/**
 * Формирует объект ответа с ошибками для client components
 */
export function formatValidationError(
  schema: z.ZodType,
  data: unknown,
): { success: false; errors: Record<string, string[]>; message?: string } {
  const result = validate(schema, data);
  
  if (result.success) {
    throw new Error('Expected validation to fail but it succeeded');
  }
  
  return {
    success: false,
    errors: getValidationErrors(result.error),
    message: 'Please check the form for errors',
  };
}

/**
 * Безопасно парсит JSON с валидацией через Zod
 */
export async function parseJsonWithSchema<T extends z.ZodType>(
  schema: T,
  response: Response,
): Promise<{ success: true; data: z.infer<T> } | { success: false; error: string }> {
  try {
    const json = await response.json();
    const result = schema.safeParse(json);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    return {
      success: false,
      error: 'Invalid response format',
    };
  } catch {
    return {
      success: false,
      error: 'Failed to parse response',
    };
  }
}
