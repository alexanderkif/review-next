export interface PrintControlsProps {
  className?: string;
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
}

export interface CVData {
  personalInfo?: {
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    github?: string;
    linkedin?: string;
    avatar?: string[];
  };
  about?: string;
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
    description: string;
  }>;
  languages?: Array<{
    language: string;
    level: string;
  }>;
  skills?: {
    frontend?: string[];
    tools?: string[];
    backend?: string[];
  };
  projects?: Project[];
}
