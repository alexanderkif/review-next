export interface CVData {
  cv: {
    id: number;
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    avatar_url: string;
    github_url: string;
    linkedin_url: string;
    about: string;
    skills_frontend: string[];
    skills_tools: string[];
    skills_backend: string[];
  };
  experience: Experience[];
  education: Education[];
  languages: Language[];
}

export interface Experience {
  id: number;
  title: string;
  company: string;
  period: string;
  description: string;
  is_current: boolean;
  sort_order: number;
}

export interface Education {
  id: number;
  degree: string;
  institution: string;
  period: string;
  description: string;
  sort_order: number;
}

export interface Language {
  id: number;
  language: string;
  level: string;
  sort_order: number;
}

export type SkillCategory = 'skills_frontend' | 'skills_tools' | 'skills_backend';
