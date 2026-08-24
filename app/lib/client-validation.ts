// Client-side Zod validation utilities for React components
import { z } from 'zod';

/**
 * Validates form data on the client side before submission
 */
export function validateClient<T extends z.ZodType>(
  schema: T,
  data: Record<string, unknown>,
): { success: boolean; errors?: Record<string, string[]>; data?: z.infer<T> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const flattened = result.error.flatten();
  const fieldErrors: Record<string, string[]> = {};
  
  for (const [field, errors] of Object.entries(flattened.fieldErrors)) {
    if (errors && Array.isArray(errors) && errors.length > 0) {
      fieldErrors[field] = errors as string[];
    }
  }
  
  return { success: false, errors: fieldErrors };
}

/**
 * Validates a single field value
 */
export function validateField<T extends z.ZodType>(
  schema: T,
  fieldName: string,
  value: unknown,
): { success: boolean; error?: string } {
  const result = schema.safeParse({ [fieldName]: value });
  
  if (result.success) {
    return { success: true };
  }
  
  const fieldErrors = result.error.flatten().fieldErrors;
  const fieldError = fieldErrors[fieldName as keyof typeof fieldErrors];
  return {
    success: false,
    error: Array.isArray(fieldError) && fieldError.length > 0 ? fieldError[0] : 'Invalid value',
  };
}

/**
 * Creates a form validation hook for React components
 */
export function useFormValidation<T extends z.ZodType>(schema: T) {
  const validateForm = (data: Record<string, unknown>) => {
    return validateClient(schema, data);
  };
  
  const getFieldError = (fieldName: string, value: unknown) => {
    return validateField(schema, fieldName, value);
  };
  
  return {
    validateForm,
    getFieldError,
  };
}

/**
 * Formats validation errors for display in UI components
 */
export function formatErrorsForDisplay(
  errors: Record<string, string[]>,
): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  for (const [field, messages] of Object.entries(errors)) {
    if (messages && messages.length > 0) {
      // Use the first error message for each field
      formatted[field] = messages[0];
    }
  }
  
  return formatted;
}

/**
 * Checks if a value matches the schema type
 */
export function isValueValid<T extends z.ZodType>(schema: T, value: unknown): boolean {
  return schema.safeParse(value).success;
}

/**
 * Safely parses JSON with Zod validation for API responses
 */
export async function parseApiResponse<T extends z.ZodType>(
  response: Response,
  schema: T,
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

/**
 * Creates a debounced validation function for real-time feedback
 */
export function createDebouncedValidation<T extends z.ZodType>(
  schema: T,
  delay: number = 300,
) {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (data: Record<string, unknown>) => {
    return new Promise<{ success: boolean; errors?: Record<string, string[]> }>((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const result = validateClient(schema, data);
        resolve(result);
      }, delay);
    });
  };
}
