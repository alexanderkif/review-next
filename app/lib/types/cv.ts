export interface CVData {
  id: string;
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    avatar?: string[] | string;
    github?: string;
    linkedin?: string;
  };
  about: string;
  experience: Array<{
    id: string;
    title: string;
    company: string;
    period: string;
    description: string;
    current: boolean;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    period: string;
    description?: string;
  }>;
  skills: {
    frontend: string[];
    tools: string[];
    backend: string[];
  };
  languages: Array<{
    language: string;
    level: string;
  }>;
  projects?: Array<{
    id: number;
    title: string;
    description: string;
    short_description?: string;
    technologies: string[];
    github_url?: string;
    demo_url?: string;
    year: string;
    status: string;
  }>;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}