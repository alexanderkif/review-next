import {
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Globe,
  Calendar,
  Award,
  BookOpen,
  Briefcase,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';
import PrintControls from './components/ui/PrintControls';
import LazyAvatar from './components/ui/LazyAvatar';
import { getCVData } from './lib/cv-service';
import Bullet from './components/ui/Bullet';
import type { Metadata } from 'next';

export const revalidate = 3600; // Cache for 1 hour

export async function generateMetadata(): Promise<Metadata> {
  const cvData = await getCVData();

  if (!cvData) {
    return {
      title: 'Portfolio - CV Not Found',
      description: 'Professional portfolio website. CV data is being loaded.',
    };
  }

  const { personalInfo, skills } = cvData;
  const allSkills = [...skills.frontend, ...skills.tools, ...skills.backend];
  const firstHighlight =
    cvData.about
      ?.split('\n')
      .find((line) => line.trim().startsWith('•') || line.trim().startsWith('-'))
      ?.replace(/^[•\-]\s*/, '') || '';

  return {
    title: `${personalInfo.name} - ${personalInfo.title}`,
    description:
      firstHighlight ||
      `${personalInfo.title} with expertise in ${allSkills.slice(0, 5).join(', ')}. Professional portfolio showcasing modern software development projects.`,
    keywords: [
      personalInfo.title?.toLowerCase(),
      'portfolio',
      'cv',
      'resume',
      ...allSkills.slice(0, 10).map((skill) => skill.toLowerCase()),
    ]
      .filter(Boolean)
      .join(', '),
    authors: [{ name: personalInfo.name }],
    openGraph: {
      title: `${personalInfo.name} - ${personalInfo.title}`,
      description: firstHighlight || `Professional ${personalInfo.title} portfolio`,
      url: personalInfo.website || undefined,
      siteName: `${personalInfo.name} Portfolio`,
      type: 'profile',
    },
  };
}

export default async function Home() {
  const cvData = await getCVData();

  if (!cvData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-slate-800">CV Not Found</h1>
          <p className="text-slate-600">CV data has not been loaded into the system yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header with print controls */}
        <div className="no-print mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">Resume</h1>
          <PrintControls />
        </div>

        {/* Main information */}
        <Card className="animate-fade-in mb-8">
          <CardContent>
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              {/* Avatar */}
              <div className="relative">
                <div className="flex items-center justify-center rounded-3xl bg-white p-[3px] shadow-[3px_3px_6px_#c5c5c5,_-1.5px_-1.5px_6px_#ffffff,_inset_-2px_-2px_1px_#8a8a8acc]">
                  <LazyAvatar
                    avatarUrl={cvData.personalInfo.avatar}
                    name={cvData.personalInfo.name}
                    size="md"
                    className="h-32 w-32 translate-x-[-1px] translate-y-[-1px] transform rounded-tl-[22px] rounded-tr-[20px] rounded-br-[22px] rounded-bl-[20px]"
                  />
                </div>
              </div>

              {/* Main information */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="mb-2 text-4xl font-bold text-slate-800">
                  {cvData.personalInfo.name}
                </h2>
                <p className="mb-4 text-xl font-medium text-slate-600">
                  {cvData.personalInfo.title}
                </p>

                {/* Contact information */}
                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                  <div className="flex items-center justify-center gap-2 md:justify-start">
                    <Mail size={16} className="text-slate-600" />
                    <a
                      href={`mailto:${cvData.personalInfo.email}`}
                      className="text-emerald-600 transition-colors duration-200 hover:text-emerald-700 hover:underline"
                    >
                      {cvData.personalInfo.email}
                    </a>
                  </div>
                  {cvData.personalInfo.phone && (
                    <div className="flex items-center justify-center gap-2 md:justify-start">
                      <Phone size={16} className="text-slate-600" />
                      {cvData.personalInfo.phone.match(/^https?:\/\//) ? (
                        <a
                          href={cvData.personalInfo.phone}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 transition-colors duration-200 hover:text-emerald-700 hover:underline"
                        >
                          {cvData.personalInfo.phone}
                        </a>
                      ) : (
                        <span className="text-slate-800">{cvData.personalInfo.phone}</span>
                      )}
                    </div>
                  )}
                  {cvData.personalInfo.location && (
                    <div className="flex items-center justify-center gap-2 md:justify-start">
                      <MapPin size={16} className="text-slate-600" />
                      <span className="text-slate-800">{cvData.personalInfo.location}</span>
                    </div>
                  )}
                  {cvData.personalInfo.website && (
                    <div className="flex items-center justify-center gap-2 md:justify-start">
                      <Globe size={16} className="text-slate-600" />
                      <a
                        href={cvData.personalInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 transition-colors duration-200 hover:text-emerald-700 hover:underline"
                      >
                        {cvData.personalInfo.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Social networks */}
                <div className="mt-4 flex justify-center gap-4 md:justify-start">
                  {cvData.personalInfo.github && (
                    <a
                      href={cvData.personalInfo.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      aria-label="Visit GitHub profile"
                    >
                      <Github size={16} className="-translate-x-[1px] -translate-y-[1px]" />
                    </a>
                  )}
                  {cvData.personalInfo.linkedin && (
                    <a
                      href={cvData.personalInfo.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      aria-label="Visit LinkedIn profile"
                    >
                      <Linkedin size={16} className="-translate-x-[1px] -translate-y-[1px]" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HIGHLIGHTS */}
        <Card className="animate-fade-in mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award size={20} className="text-emerald-600" />
              HIGHLIGHTS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="leading-relaxed text-slate-700">
              {cvData.about
                ? cvData.about
                    .split('\n')
                    .map((line, index) => {
                      const trimmedLine = line.trim();
                      if (!trimmedLine) return null;

                      // If line starts with • or -, format as list item
                      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                        return (
                          <div key={index} className="flex items-start gap-3">
                            <Bullet className="mt-1" />
                            <span className="text-sm leading-relaxed text-slate-700">
                              {trimmedLine.replace(/^[•\-]\s*/, '')}
                            </span>
                          </div>
                        );
                      }

                      // Regular paragraph
                      return (
                        <p key={index} className="mb-3">
                          {trimmedLine}
                        </p>
                      );
                    })
                    .filter(Boolean)
                : null}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Work Experience */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase size={20} className="text-emerald-600" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {cvData.experience.map((exp) => (
                <div key={exp.id} className="mb-6 flex items-start gap-4">
                  <Bullet className="mt-1" size="md" />
                  <div>
                    <h4 className="font-semibold text-slate-800">{exp.title}</h4>
                    <p className="mb-1 text-sm text-slate-600">{exp.company}</p>
                    <p className="mb-2 flex items-center gap-1 text-xs text-slate-500">
                      <Calendar size={12} />
                      {exp.period}
                    </p>
                    <p className="text-sm text-slate-700">{exp.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Education and skills */}
          <div className="space-y-8">
            {/* Education */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen size={20} className="text-emerald-600" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cvData.education.map((edu) => (
                    <div key={edu.id}>
                      <h4 className="font-semibold text-slate-800">{edu.degree}</h4>
                      <p className="text-sm text-slate-600">{edu.institution}</p>
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar size={12} />
                        {edu.period}
                      </p>
                      {edu.description && (
                        <p className="mt-1 text-sm text-slate-700">
                          {edu.description
                            .split(/(https:\/\/www\.credly\.com\/badges\/[^\s]+)/g)
                            .map((part, index) => {
                              if (part.match(/https:\/\/www\.credly\.com\/badges\/[^\s]+/)) {
                                return (
                                  <a
                                    key={index}
                                    href={part}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 transition-colors duration-200 hover:text-emerald-700 hover:underline"
                                  >
                                    {part}
                                  </a>
                                );
                              }
                              return part;
                            })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Technical Skills */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings size={22} className="text-emerald-600" />
                  Technical Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cvData.skills.frontend.length > 0 && (
                    <div>
                      <h4 className="mb-1 text-sm text-slate-600">Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {cvData.skills.frontend.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/80 px-3 py-1.5 text-sm text-blue-700 shadow-[1.5px_1.5px_3px_#c5c5c5,_inset_-2px_-2px_1px_#8a8a8acc]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {cvData.skills.tools.length > 0 && (
                    <div>
                      <h4 className="mb-1 text-sm text-slate-600">Tools</h4>
                      <div className="flex flex-wrap gap-2">
                        {cvData.skills.tools.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-xl bg-gradient-to-br from-green-50 to-green-100/80 px-3 py-1.5 text-sm text-green-700 shadow-[1.5px_1.5px_3px_#c5c5c5,_inset_-2px_-2px_1px_#8a8a8acc]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {cvData.skills.backend.length > 0 && (
                    <div>
                      <h4 className="mb-1 text-sm text-slate-600">Methodologies/Practices</h4>
                      <div className="flex flex-wrap gap-2">
                        {cvData.skills.backend.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/80 px-3 py-1.5 text-sm text-purple-700 shadow-[1.5px_1.5px_3px_#c5c5c5,_inset_-2px_-2px_1px_#8a8a8acc]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {cvData.languages.length > 0 && (
                    <div>
                      <h4 className="mb-1 text-sm text-slate-600">Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {cvData.languages.map((lang) => (
                          <span
                            key={lang.language}
                            className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/80 px-3 py-1.5 text-sm text-slate-700 shadow-[1.5px_1.5px_3px_#c5c5c5,_inset_-2px_-2px_1px_#8a8a8acc]"
                          >
                            {lang.language} ({lang.level})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
