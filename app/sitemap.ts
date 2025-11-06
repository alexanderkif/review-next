import { getProjects, type Project } from './lib/db';
import { serverLogger } from './lib/logger';

export default async function sitemap() {
  const baseUrl = 'https://aleksandr-nikiforov-cv.vercel.app';
  
  // Get projects for dynamic URLs
  let projects: Project[] = [];
  try {
    projects = await getProjects();
  } catch (error) {
    serverLogger.error('Error fetching projects for sitemap:', error);
  }

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Dynamic project pages
  const projectPages = projects.map((project: Project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified: new Date(project.created_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...projectPages];
}