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
  status: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in-progress':
      return 'In Progress';
    case 'archived':
      return 'Archived';
    default:
      return status;
  }
};

export const createEmptyProject = (): Project => ({
  id: 0,
  title: '',
  description: '',
  short_description: '',
  technologies: [],
  github_url: '',
  demo_url: '',
  image_urls: [],
  year: new Date().getFullYear(),
  featured: false,
  status: 'completed',
  likes_count: 0,
  comments_count: 0,
  created_at: new Date().toISOString(),
});
