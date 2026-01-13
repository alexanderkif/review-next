'use server';

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { auth } from '../../auth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// Схемы валидации
const LoginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const RegisterSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const CommentSchema = z.object({
  projectId: z.number(),
  comment: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
});

// Аутентификация
export async function loginUser(prevState: unknown, formData: FormData) {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Проверьте правильность заполнения полей.',
    };
  }

  const { email, password } = validatedFields.data;

  try {
    // Получаем пользователя из базы данных
    const user = await sql`
      SELECT id, email, name, password_hash
      FROM users
      WHERE email = ${email}
    `;

    if (user.length === 0) {
      return {
        message: 'User with this email not found.',
      };
    }

    const userRow = user[0];

    // Проверяем пароль
    const passwordMatch = await bcrypt.compare(password, userRow.password_hash);

    if (!passwordMatch) {
      return {
        message: 'Invalid password.',
      };
    }

    // Здесь должна быть логика создания сессии
    // В демо версии просто перенаправляем на главную
  } catch (error) {
    console.error('Login error:', error);
    return {
      message: 'An error occurred while logging into the system.',
    };
  }

  redirect('/');
}

export async function registerUser(prevState: unknown, formData: FormData) {
  const validatedFields = RegisterSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Проверьте правильность заполнения полей.',
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    // Check if user exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return {
        message: 'User with this email already exists.',
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email}, ${hashedPassword})
      RETURNING id, name, email
    `;
  } catch (error) {
    console.error('Registration error:', error);
    return {
      message: 'Registration error occurred.',
    };
  }

  redirect('/auth/login?registered=true');
}

// Лайки проектов
export async function toggleProjectLike(projectId: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const userId = session.user.id;

    // Check if like already exists
    const existingLike = await sql`
      SELECT id FROM project_likes
      WHERE project_id = ${projectId} AND user_id = ${userId}
    `;

    if (existingLike.length > 0) {
      // Убираем лайк
      await sql`
        DELETE FROM project_likes
        WHERE project_id = ${projectId} AND user_id = ${userId}
      `;
    } else {
      // Добавляем лайк
      await sql`
        INSERT INTO project_likes (project_id, user_id)
        VALUES (${projectId}, ${userId})
      `;
    }

    revalidatePath('/projects');
    return { success: true };
  } catch (error) {
    console.error('Toggle like error:', error);
    return {
      message: 'Error processing like.',
    };
  }
}

// Комментарии к проектам
export async function addProjectComment(projectId: number, comment: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const userId = session.user.id;

    const validatedFields = CommentSchema.safeParse({
      projectId,
      comment,
    });

    if (!validatedFields.success) {
      throw new Error('Invalid comment data');
    }

    await sql`
      INSERT INTO project_comments (project_id, user_id, comment)
      VALUES (${projectId}, ${userId}, ${comment})
    `;

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/projects');
  } catch (error) {
    console.error('Add comment error:', error);
    throw error;
  }
}

// Альтернативная версия для form actions
export async function addProjectCommentAction(prevState: unknown, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        message: 'Необходимо авторизоваться для добавления комментариев.',
      };
    }

    const userId = session.user.id;

    const validatedFields = CommentSchema.safeParse({
      projectId: parseInt(formData.get('projectId') as string),
      comment: formData.get('comment'),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Проверьте правильность заполнения полей.',
      };
    }

    const { projectId, comment } = validatedFields.data;

    await sql`
      INSERT INTO project_comments (project_id, user_id, comment)
      VALUES (${projectId}, ${userId}, ${comment})
    `;

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/projects');
    return { success: true, message: 'Комментарий добавлен успешно.' };
  } catch (error) {
    console.error('Add comment error:', error);
    return {
      message: 'Произошла Error adding comment.',
    };
  }
}

// Comment management functions
export async function updateComment(commentId: number, content: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    // Check if user owns the comment or is admin and get project_id
    const comment = await sql`
      SELECT user_id, project_id FROM project_comments WHERE id = ${commentId}
    `;

    if (comment.length === 0) {
      throw new Error('Comment not found');
    }

    const isOwner = comment[0].user_id === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new Error('Unauthorized to edit this comment');
    }

    // Update the comment
    await sql`
      UPDATE project_comments
      SET comment = ${content}, updated_at = NOW()
      WHERE id = ${commentId}
    `;

    // Revalidate paths using the project_id we already have
    revalidatePath(`/projects/${comment[0].project_id}`);
    revalidatePath('/projects');

    return { success: true };
  } catch (error) {
    console.error('Update comment error:', error);
    throw error;
  }
}

export async function deleteComment(commentId: number) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    // Check if user owns the comment or is admin and get project_id
    const comment = await sql`
      SELECT user_id, project_id FROM project_comments WHERE id = ${commentId}
    `;

    if (comment.length === 0) {
      throw new Error('Comment not found');
    }

    const isOwner = comment[0].user_id === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new Error('Unauthorized to delete this comment');
    }

    // Delete the comment
    await sql`
      DELETE FROM project_comments WHERE id = ${commentId}
    `;

    // Revalidate paths using the project_id we already have
    revalidatePath(`/projects/${comment[0].project_id}`);
    revalidatePath('/projects');

    return { success: true };
  } catch (error) {
    console.error('Delete comment error:', error);
    throw error;
  }
}
