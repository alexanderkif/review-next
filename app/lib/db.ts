import postgres from 'postgres';
import { unstable_noStore as noStore } from 'next/cache';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// Типы данных
export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  email_verified?: boolean;
  email_verification_token?: string;
  email_verification_expires?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  short_description?: string;
  technologies: string[];
  github_url?: string;
  demo_url?: string;
  image_urls: string[];
  year: number;
  featured: boolean;
  status: 'in-progress' | 'completed' | 'archived';
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  user_has_liked?: boolean;
}

export interface ProjectLike {
  id: number;
  project_id: number;
  user_id: number;
  created_at: string;
}

export interface ProjectComment {
  id: number;
  project_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at?: string;
  user_name: string;
  user_avatar?: string;
}

// Функции для работы с проектами
export async function getProjects(userId?: string): Promise<Project[]> {
  noStore();
  try {
    // Getting projects from database
    let data;
    
    if (userId) {
      data = await sql`
        SELECT 
          p.*,
          COUNT(DISTINCT pl.id) as likes_count,
          COUNT(DISTINCT pc.id) as comments_count,
          CASE WHEN upl.user_id IS NOT NULL THEN true ELSE false END as user_has_liked
        FROM projects p
        LEFT JOIN project_likes pl ON p.id = pl.project_id
        LEFT JOIN project_comments pc ON p.id = pc.project_id
        LEFT JOIN project_likes upl ON p.id = upl.project_id AND upl.user_id = ${userId}
        GROUP BY p.id, upl.user_id
        ORDER BY p.featured DESC, p.year DESC, p.created_at DESC
      `;
    } else {
      data = await sql`
        SELECT 
          p.*,
          COUNT(DISTINCT pl.id) as likes_count,
          COUNT(DISTINCT pc.id) as comments_count
        FROM projects p
        LEFT JOIN project_likes pl ON p.id = pl.project_id
        LEFT JOIN project_comments pc ON p.id = pc.project_id
        GROUP BY p.id
        ORDER BY p.featured DESC, p.year DESC, p.created_at DESC
      `;
    }
    
    // Projects loaded successfully
    
    return data.map(row => {
      // Parse image URLs array and convert UUIDs to full URLs
      let imageUrls: string[] = [];
      if (row.image_urls) {
        try {
          const parsed = Array.isArray(row.image_urls) ? row.image_urls : JSON.parse(row.image_urls);
          imageUrls = parsed.map((uuid: string) => `/api/images/${uuid}`);
        } catch {
          console.warn(`Failed to parse image_urls for project ${row.id}`);
        }
      }

      return {
        ...row,
        image_urls: imageUrls,
        likes_count: Number(row.likes_count) || 0,
        comments_count: Number(row.comments_count) || 0,
        user_has_liked: row.user_has_liked || false
      };
    }) as Project[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch projects.');
  }
}

export async function getProjectById(id: number, userId?: string): Promise<Project | null> {
  noStore();
  try {
    let data;
    
    if (userId) {
      data = await sql`
        SELECT 
          p.*,
          COUNT(DISTINCT pl.id) as likes_count,
          COUNT(DISTINCT pc.id) as comments_count,
          CASE WHEN upl.user_id IS NOT NULL THEN true ELSE false END as user_has_liked
        FROM projects p
        LEFT JOIN project_likes pl ON p.id = pl.project_id
        LEFT JOIN project_comments pc ON p.id = pc.project_id
        LEFT JOIN project_likes upl ON p.id = upl.project_id AND upl.user_id = ${userId}
        WHERE p.id = ${id}
        GROUP BY p.id, upl.user_id
      `;
    } else {
      data = await sql`
        SELECT 
          p.*,
          COUNT(DISTINCT pl.id) as likes_count,
          COUNT(DISTINCT pc.id) as comments_count,
          false as user_has_liked
        FROM projects p
        LEFT JOIN project_likes pl ON p.id = pl.project_id
        LEFT JOIN project_comments pc ON p.id = pc.project_id
        WHERE p.id = ${id}
        GROUP BY p.id
      `;
    }
    
    if (data.length === 0) {
      return null;
    }
    
    const row = data[0];
    return {
      ...row,
      likes_count: Number(row.likes_count) || 0,
      comments_count: Number(row.comments_count) || 0,
      user_has_liked: row.user_has_liked || false
    } as Project;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch project.');
  }
}

export async function getProjectComments(projectId: number): Promise<ProjectComment[]> {
  noStore();
  try {
    const data = await sql`
      SELECT 
        pc.id,
        pc.project_id,
        pc.user_id,
        pc.comment as content,
        pc.created_at,
        pc.updated_at,
        u.name as user_name,
        u.avatar_url as user_avatar
      FROM project_comments pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.project_id = ${projectId}
      ORDER BY pc.created_at DESC
    `;
    
    return data as unknown as ProjectComment[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch project comments.');
  }
}

// Функции для работы с пользователями
export async function getUserByEmail(email: string): Promise<User | null> {
  noStore();
  try {
    const data = await sql`
      SELECT id, email, name, avatar_url, created_at
      FROM users 
      WHERE email = ${email}
    `;
    
    if (data.length === 0) {
      return null;
    }
    
    return data[0] as User;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function getUserById(id: number): Promise<User | null> {
  noStore();
  try {
    const data = await sql`
      SELECT id, email, name, avatar_url, created_at
      FROM users 
      WHERE id = ${id}
    `;
    
    if (data.length === 0) {
      return null;
    }
    
    return data[0] as User;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function createProjectComment(
  projectId: number, 
  userId: string, 
  comment: string
): Promise<ProjectComment> {
  noStore();
  try {
    const data = await sql`
      INSERT INTO project_comments (project_id, user_id, comment)
      VALUES (${projectId}, ${userId}, ${comment})
      RETURNING *
    `;
    
    if (data.length === 0) {
      throw new Error('Failed to create comment.');
    }
    
    // Получаем информацию о пользователе для возврата
    const commentWithUser = await sql`
      SELECT 
        pc.id,
        pc.project_id,
        pc.user_id,
        pc.comment as content,
        pc.created_at,
        u.name as user_name,
        u.avatar_url as user_avatar
      FROM project_comments pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.id = ${data[0].id}
    `;
    
    return commentWithUser[0] as ProjectComment;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create project comment.');
  }
}



// Получение данных активности (лайки и комментарии) по дням
interface ActivityRow {
  date: string;
  count: number;
}

export async function getActivityData(period: 'month' | 'year' = 'month', locale: string = 'en-US') {
  noStore();
  try {
    let likesData: ActivityRow[] = [];
    let commentsData: ActivityRow[] = [];
    
    // Безопасно получаем данные лайков
    try {
      if (period === 'month') {
        likesData = await sql`
          SELECT 
            DATE(created_at AT TIME ZONE 'UTC+3') as date,
            COUNT(*) as count
          FROM project_likes
          WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY DATE(created_at AT TIME ZONE 'UTC+3')
          ORDER BY date
        `;
      } else {
        likesData = await sql`
          SELECT 
            DATE_TRUNC('month', created_at AT TIME ZONE 'UTC+3') as date,
            COUNT(*) as count
          FROM project_likes
          WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '11 months')
          GROUP BY DATE_TRUNC('month', created_at AT TIME ZONE 'UTC+3')
          ORDER BY date
        `;
      }
    } catch {
      console.log('project_likes table not available');
    }
    
    // Безопасно получаем данные комментариев
    try {
      if (period === 'month') {
        commentsData = await sql`
          SELECT 
            DATE(created_at AT TIME ZONE 'UTC+3') as date,
            COUNT(*) as count
          FROM project_comments
          WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY DATE(created_at AT TIME ZONE 'UTC+3')
          ORDER BY date
        `;
      } else {
        commentsData = await sql`
          SELECT 
            DATE_TRUNC('month', created_at AT TIME ZONE 'UTC+3') as date,
            COUNT(*) as count
          FROM project_comments
          WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '11 months')
          GROUP BY DATE_TRUNC('month', created_at AT TIME ZONE 'UTC+3')
          ORDER BY date
        `;
      }
    } catch {
      console.log('project_comments table not available');
    }
    
    // Объединяем данные по датам
    const dateMap = new Map();
    
    // Обрабатываем лайки
    likesData.forEach((row: ActivityRow) => {
      const date = new Date(row.date);
      const dateStr = period === 'month' 
        ? date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })
        : date.toLocaleDateString(locale, { month: 'short', year: '2-digit' });
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { date: dateStr, likes: 0, comments: 0 });
      }
      dateMap.get(dateStr).likes = Number(row.count);
    });
    
    // Обрабатываем комментарии
    commentsData.forEach((row: ActivityRow) => {
      const date = new Date(row.date);
      const dateStr = period === 'month' 
        ? date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })
        : date.toLocaleDateString(locale, { month: 'short', year: '2-digit' });
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { date: dateStr, likes: 0, comments: 0 });
      }
      dateMap.get(dateStr).comments = Number(row.count);
    });
    
    // Генерируем полный диапазон дат
    const result = [];
    const now = new Date();
    
    if (period === 'month') {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
        result.push(dateMap.get(dateStr) || { date: dateStr, likes: 0, comments: 0 });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const dateStr = date.toLocaleDateString(locale, { month: 'short', year: '2-digit' });
        result.push(dateMap.get(dateStr) || { date: dateStr, likes: 0, comments: 0 });
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('Failed to fetch activity data:', error);
    return [];
  }
}
