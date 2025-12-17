// Common API types
export interface ApiError {
  error: string;
  details?: string;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

// Activity API
export interface ActivityDataPoint {
  date: string;
  likes: number;
  comments: number;
  likesProjects?: string[];
  commentsProjects?: string[];
}

export type ActivityResponse = ActivityDataPoint[];

// Admin - Images API
export interface ImageMetadata {
  id: string;
  entity_type: string;
  entity_id: string;
  mime_type: string;
  size_bytes: number;
  width?: number;
  height?: number;
}

export interface ImageUploadRequest {
  entityType: 'avatar' | 'project' | 'user';
  entityId: string;
  imageData: string;
  mimeType: string;
  width?: number;
  height?: number;
}

export interface ImageUploadResponse {
  success: true;
  imageId: string;
  imageIds: string[];
  url: string;
}

export interface ImageDeleteResponse {
  success: true;
  message: string;
  imageIds: string[];
}

// Admin - Projects API
export interface Project {
  id: number;
  title: string;
  description: string;
  short_description: string;
  technologies: string[];
  github_url?: string;
  demo_url?: string;
  image_urls?: string[];
  year: number;
  featured: boolean;
  status: 'completed' | 'in-progress' | 'archived';
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_has_liked?: boolean;
}

export interface ProjectCreateRequest {
  title: string;
  description: string;
  short_description: string;
  technologies: string[];
  github_url?: string;
  demo_url?: string;
  image_urls?: string[];
  year: number;
  featured: boolean;
  status: string;
}

export interface ProjectUpdateRequest extends Partial<ProjectCreateRequest> {
  id: number;
}

// Admin - CV API
export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
}

export interface Experience {
  id?: number;
  title: string;
  company: string;
  period: string;
  description: string;
  current?: boolean;
}

export interface Education {
  id?: number;
  degree: string;
  institution: string;
  period: string;
  description?: string;
}

export interface Language {
  id?: number;
  language: string;
  level: string;
}

export interface Skills {
  frontend?: string[];
  backend?: string[];
  tools?: string[];
}

export interface CVData {
  personalInfo?: PersonalInfo & { avatar?: string[] };
  about?: string;
  skills?: Skills;
  experience?: Array<{
    title: string;
    company: string;
    period: string;
    description: string;
    current?: boolean;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    period: string;
    description?: string;
  }>;
  languages?: Array<{
    language: string;
    level: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
    year: number;
    github_url?: string;
    demo_url?: string;
    status: string;
  }>;
}

export interface CVUpdateRequest {
  personalInfo?: PersonalInfo;
  about?: string;
  skills?: Skills;
}

// Admin - Database API
export interface ResetDatabaseResponse {
  message: string;
  cleared_tables: string[];
  skipped_tables: string[];
  seeded_data: {
    success: boolean;
    cvId?: string;
    projectIds?: string[];
  };
  info: string;
}

export interface CleanUnusedImagesResponse {
  success: true;
  message: string;
  deleted: number;
}

export interface SyncImagesResponse {
  success: true;
  message: string;
  updatedCount: number;
  details: Array<{
    projectId: number;
    oldImageUrls: string[];
    newImageUrls: string[];
  }>;
}

// Comments API
export interface Comment {
  id: number;
  project_id: number;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentCreateRequest {
  project_id: number;
  content: string;
}

export interface CommentUpdateRequest {
  content: string;
}

export interface CommentResponse {
  success: true;
  comment: Comment;
}

export interface CommentsListResponse {
  comments: Comment[];
}

// Likes API
export interface LikeToggleResponse {
  success: true;
  liked: boolean;
  likes_count: number;
}

// Image Reassign API
export interface ImageReassignRequest {
  entityType: 'avatar' | 'project' | 'user';
  oldEntityId: string;
  newEntityId: string;
  imageIds: string[];
}

export interface ImageReassignResponse {
  success: true;
  message: string;
  reassignedCount: number;
}
