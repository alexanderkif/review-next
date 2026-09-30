// Zod validation schemas for the entire application
import { z } from 'zod';
import { IMAGE_SIZE_LIMITS, SUPPORTED_FORMATS, validateBase64Image } from '@/lib/image-utils';

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

export const RegisterRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Enter a valid email').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const ResendVerificationRequestSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

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
  hidden: z.boolean().default(false),
  status: z.enum(['completed', 'in-progress', 'archived']).default('completed'),
});

export type ProjectCreateData = z.infer<typeof ProjectCreateSchema>;

export const ProjectUpdateSchema = ProjectCreateSchema.partial().merge(
  z.object({ id: z.number() }),
);

export type ProjectUpdateData = z.infer<typeof ProjectUpdateSchema>;

export const NumericIdParamsSchema = z.object({ id: z.coerce.number().int().positive() });
export const ProjectImageParamsSchema = z.object({
  projectId: z.coerce.number().int().positive(),
});
export const CVImageParamsSchema = z.object({ cvId: z.coerce.number().int().positive() });
export const StringIdParamsSchema = z.object({ id: z.string().min(1) });

export const ActivityQuerySchema = z.object({
  period: z.enum(['month', 'year']).default('month'),
});

export const EmailQuerySchema = z.object({
  email: z.string().email('Enter a valid email'),
});

export const VerificationTokenQuerySchema = z.object({
  token: z.string().min(1).max(512),
});

export const AdminImagesQuerySchema = z.object({
  entityType: z.enum(['avatar', 'project', 'user']),
  entityId: z.string().min(1),
});

export const ImageOptimizationQuerySchema = z.object({
  w: z.coerce.number().int().positive().max(4096).optional(),
  q: z.coerce.number().int().min(1).max(100).default(80),
});

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
  is_current: z.boolean().default(false),
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
  skills: z
    .object({
      frontend: z.array(z.string()).optional(),
      backend: z.array(z.string()).optional(),
      tools: z.array(z.string()).optional(),
    })
    .optional(),
});

export type CVUpdateData = z.infer<typeof CVUpdateSchema>;

const AdminCVTextSchema = z.string().nullable().optional();

export const AdminCVUpdateSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: AdminCVTextSchema,
  title: AdminCVTextSchema,
  email: z
    .union([z.string().email(), z.literal('')])
    .nullable()
    .optional(),
  phone: AdminCVTextSchema,
  location: AdminCVTextSchema,
  website: AdminCVTextSchema,
  avatar_url: z
    .union([z.string(), z.array(z.string())])
    .nullable()
    .optional()
    .transform((value) => (Array.isArray(value) ? JSON.stringify(value) : value)),
  github_url: AdminCVTextSchema,
  linkedin_url: AdminCVTextSchema,
  about: AdminCVTextSchema,
  skills_frontend: z.array(z.string()).nullable().optional(),
  skills_tools: z.array(z.string()).nullable().optional(),
  skills_backend: z.array(z.string()).nullable().optional(),
});

export const AdminCVExperienceRequestSchema = z.object({
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      period: z.string().default(''),
      description: z.string().default(''),
      is_current: z.boolean().default(false),
    }),
  ),
});

export const AdminCVEducationRequestSchema = z.object({
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      period: z.string().default(''),
      description: z.string().default(''),
    }),
  ),
});

export const AdminCVLanguagesRequestSchema = z.object({
  languages: z.array(
    z.object({
      language: z.string(),
      level: z.string(),
    }),
  ),
});

// ==================== Image Schemas ====================

export const ImageUploadSchema = z
  .object({
    entityType: z.enum(['avatar', 'project', 'user']),
    entityId: z.string().min(1, 'Entity ID is required'),
    imageData: z.string().min(1, 'Image data is required'),
    mimeType: z.enum(SUPPORTED_FORMATS),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
  })
  .superRefine(({ entityType, imageData }, context) => {
    const maxSizeMB =
      entityType === 'avatar'
        ? IMAGE_SIZE_LIMITS.AVATAR
        : entityType === 'project'
          ? IMAGE_SIZE_LIMITS.PROJECT
          : IMAGE_SIZE_LIMITS.GENERAL;
    const imageError = validateBase64Image(imageData, maxSizeMB);

    if (imageError) {
      context.addIssue({ code: 'custom', path: ['imageData'], message: imageError });
    }
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
  imageIds: z.array(z.string().min(1)),
});

export type ImageReassignData = z.infer<typeof ImageReassignSchema>;

export const ChatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z
          .string()
          .trim()
          .min(1)
          .transform((content) => content.slice(0, 600)),
      }),
    )
    .min(1),
});

// ==================== Setup Schemas ====================

export const SetupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type SetupData = z.infer<typeof SetupSchema>;

export const AdminSetupRequestSchema = SetupSchema.extend({
  setupToken: z.string().max(512).optional(),
});

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
export function validateFormData<T extends z.ZodType>(schema: T, formData: FormData) {
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
