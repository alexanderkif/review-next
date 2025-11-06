'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import MultipleImageUpload from '../../components/ui/MultipleImageUpload';
import { Save, Plus, Trash2, User, Briefcase, GraduationCap, Languages } from 'lucide-react';
import { logger } from '../../lib/logger';
import { useToast } from '../../components/ui/ToastContainer';

interface CVData {
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
  experience: Array<{
    id: number;
    title: string;
    company: string;
    period: string;
    description: string;
    is_current: boolean;
    sort_order: number;
  }>;
  education: Array<{
    id: number;
    degree: string;
    institution: string;
    period: string;
    description: string;
    sort_order: number;
  }>;
  languages: Array<{
    id: number;
    language: string;
    level: string;
    sort_order: number;
  }>;
}

export default function CVEditor() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [activeSection, setActiveSection] = useState('personal');

  useEffect(() => {
    fetchCVData();
  }, []);

  const fetchCVData = async () => {
    try {
      const response = await fetch('/api/admin/cv');
      if (response.ok) {
        const data = await response.json();
        // Normalize data in case fields are empty
        const normalizedData = {
          ...data,
          experience: data.experience || [],
          education: data.education || [],
          languages: data.languages || []
        };
        setCvData(normalizedData);
      } else {
        logger.error('Failed to fetch CV cvData');
      }
    } catch (error) {
      logger.error('Error fetching CV cvData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersonalInfo = async () => {
    if (!cvData) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/cv', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cvData.cv),
      });

      if (response.ok) {
        showToast('Data saved successfully!', 'success');
      } else {
        showToast('Error saving data', 'error');
      }
    } catch (error) {
      logger.error('Error saving CV data:', error);
      showToast('Error saving data', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updatePersonalField = (field: keyof CVData['cv'], value: string | string[]) => {
    if (!cvData) return;
    setCvData({
      ...cvData,
      cv: {
        ...cvData.cv,
        [field]: value
      }
    });
  };

  const updateSkills = (category: 'skills_frontend' | 'skills_tools' | 'skills_backend', skills: string[]) => {
    updatePersonalField(category, skills);
  };

  const addSkill = (category: 'skills_frontend' | 'skills_tools' | 'skills_backend') => {
    if (!cvData) return;
    const currentSkills = cvData.cv[category] || [];
    updateSkills(category, [...currentSkills, '']);
  };

  const removeSkill = (category: 'skills_frontend' | 'skills_tools' | 'skills_backend', index: number) => {
    if (!cvData) return;
    const currentSkills = cvData.cv[category] || [];
    updateSkills(category, currentSkills.filter((_, i) => i !== index));
  };

  const updateSkill = (category: 'skills_frontend' | 'skills_tools' | 'skills_backend', index: number, value: string) => {
    if (!cvData) return;
    const currentSkills = [...(cvData.cv[category] || [])];
    currentSkills[index] = value;
    updateSkills(category, currentSkills);
  };

  // Experience functions
  const updateExperience = (index: number, field: string, value: string | boolean) => {
    if (!cvData) return;
    const updatedExperience = [...(cvData.experience || [])];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    setCvData({ ...cvData, experience: updatedExperience });
  };

  const addExperience = () => {
    if (!cvData) return;
    const newExp = {
      id: Date.now(), // temporary ID
      title: '',
      company: '',
      period: '',
      description: '',
      is_current: false,
      sort_order: (cvData.experience || []).length
    };
    setCvData({ ...cvData, experience: [...(cvData.experience || []), newExp] });
  };

  const removeExperience = (index: number) => {
    if (!cvData) return;
    const updatedExperience = (cvData.experience || []).filter((_, i) => i !== index);
    setCvData({ ...cvData, experience: updatedExperience });
  };

  const handleSaveExperience = async () => {
    if (!cvData) return;
    setSaving(true);
    try {
      const response = await fetch('/api/admin/cv/experience', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experience: cvData.experience }),
      });
      if (response.ok) {
        showToast('Work experience saved successfully!', 'success');
        fetchCVData(); // Refresh cvData
      } else {
        showToast('Error saving work experience', 'error');
      }
    } catch (error) {
      logger.error('Error saving experience:', error);
      showToast('Error saving work experience', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Education functions
  const updateEducation = (index: number, field: string, value: string) => {
    if (!cvData) return;
    const updatedEducation = [...(cvData.education || [])];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setCvData({ ...cvData, education: updatedEducation });
  };

  const addEducation = () => {
    if (!cvData) return;
    const newEdu = {
      id: Date.now(), // temporary ID
      degree: '',
      institution: '',
      period: '',
      description: '',
      sort_order: (cvData.education || []).length
    };
    setCvData({ ...cvData, education: [...(cvData.education || []), newEdu] });
  };

  const removeEducation = (index: number) => {
    if (!cvData) return;
    const updatedEducation = (cvData.education || []).filter((_, i) => i !== index);
    setCvData({ ...cvData, education: updatedEducation });
  };

  const handleSaveEducation = async () => {
    if (!cvData) return;
    setSaving(true);
    try {
      const response = await fetch('/api/admin/cv/education', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ education: cvData.education }),
      });
      if (response.ok) {
        showToast('Education saved successfully!', 'success');
        fetchCVData(); // Refresh cvData
      } else {
        showToast('Error saving education', 'error');
      }
    } catch (error) {
      logger.error('Error saving education:', error);
      showToast('Error saving education', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Languages functions
  const updateLanguage = (index: number, field: string, value: string) => {
    if (!cvData) return;
    const updatedLanguages = [...(cvData.languages || [])];
    updatedLanguages[index] = { ...updatedLanguages[index], [field]: value };
    setCvData({ ...cvData, languages: updatedLanguages });
  };

  const addLanguage = () => {
    if (!cvData) return;
    const newLang = {
      id: Date.now(), // temporary ID
      language: '',
      level: '',
      sort_order: (cvData.languages || []).length
    };
    setCvData({ ...cvData, languages: [...(cvData.languages || []), newLang] });
  };

  const removeLanguage = (index: number) => {
    if (!cvData) return;
    const updatedLanguages = (cvData.languages || []).filter((_, i) => i !== index);
    setCvData({ ...cvData, languages: updatedLanguages });
  };

  const handleSaveLanguages = async () => {
    if (!cvData) return;
    setSaving(true);
    try {
      const response = await fetch('/api/admin/cv/languages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ languages: cvData.languages }),
      });
      if (response.ok) {
        showToast('Languages saved successfully!', 'success');
        fetchCVData(); // Refresh cvData
      } else {
        showToast('Error saving languages', 'error');
      }
    } catch (error) {
      logger.error('Error saving languages:', error);
      showToast('Error saving languages', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cvData) {
    return (
      <Card >
        <CardContent className="p-6">
          <p className="text-slate-600">CV data not found</p>
        </CardContent>
      </Card>
    );
  }

  const sections = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'experience', label: 'Work Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'languages', label: 'Languages', icon: Languages },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex flex-wrap space-x-1 bg-gradient-to-br from-[#e8edf2] to-[#dfe7ed] px-1 py-2 rounded-xl shadow-[4.5px_4.5px_9px_#c5c5c5,_-2.25px_-2.25px_9px_#ffffff,_inset_-2px_-2px_1.5px_#8a8a8acc] mb-8 gap-y-1">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-[3px_3px_6px_#9ca3af,_-1.5px_-1.5px_6px_rgba(255,255,255,0.1)]'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon size={16} />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Personal Information */}
      {activeSection === 'personal' && (
        <Card >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <Input
                  value={cvData.cv.name || ''}
                  onChange={(e) => updatePersonalField('name', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Position
                </label>
                <Input
                  value={cvData.cv.title || ''}
                  onChange={(e) => updatePersonalField('title', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={cvData.cv.email || ''}
                  onChange={(e) => updatePersonalField('email', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone
                </label>
                <Input
                  value={cvData.cv.phone || ''}
                  onChange={(e) => updatePersonalField('phone', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location
                </label>
                <Input
                  value={cvData.cv.location || ''}
                  onChange={(e) => updatePersonalField('location', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Website
                </label>
                <Input
                  value={cvData.cv.website || ''}
                  onChange={(e) => updatePersonalField('website', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  GitHub URL
                </label>
                <Input
                  value={cvData.cv.github_url || ''}
                  onChange={(e) => updatePersonalField('github_url', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  LinkedIn URL
                </label>
                <Input
                  value={cvData.cv.linkedin_url || ''}
                  onChange={(e) => updatePersonalField('linkedin_url', e.target.value)}
                />
              </div>
            </div>

            {/* Avatar Upload - Multiple Images */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Profile Avatars
                <span className="text-xs text-slate-500 block mt-1">
                  Upload multiple photos for avatar rotation (changes every 5 seconds)
                </span>
              </label>
              <MultipleImageUpload
                entityType="avatar"
                entityId={cvData.cv.id.toString()}
                value={(() => {
                  const avatarUrl = cvData.cv.avatar_url;
                  if (!avatarUrl || avatarUrl === '[]' || avatarUrl === '') return [];
                  try {
                    return Array.isArray(avatarUrl) ? avatarUrl : JSON.parse(avatarUrl);
                  } catch {
                    // If not JSON, treat as direct UUID (legacy format)
                    return [avatarUrl];
                  }
                })()}
                onUpdate={(imageIds: string[]) => {
                  updatePersonalField('avatar_url', JSON.stringify(imageIds));
                  // Force re-render by updating state
                  setCvData(prev => prev ? ({
                    ...prev,
                    cv: { ...prev.cv, avatar_url: JSON.stringify(imageIds) }
                  }) : null);
                }}
                maxImages={5}
                maxSize={1}
                placeholder="Upload avatar photos"
                className=""
                isAvatar={true}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                HIGHLIGHTS
              </label>
              <Textarea
                rows={8}
                value={cvData.cv.about || ''}
                onChange={(e) => updatePersonalField('about', e.target.value)}
                placeholder="Enter key highlights, one per line. Use � or - for bullet points:&#10;&#10;� Profound understanding of JavaScript/TypeScript, SPA/PWA, HTML/CSS/SCSS&#10;� Experience with Agile, Jira, Azure, CI/CD pipelines, WCAG, Accessibility&#10;� Professional experience in computer technologies, networks, programming&#10;� Strong skills in electronics. My hobby is Arduino&#10;� Bachelor's degree in informatics and computer engineering&#10;� Open to relocate"
              />
            </div>

            {/* Skills */}
            <div className="space-y-6">
              {/* Technologies */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Technologies
                  </label>
                  <Button
                    size="sm"
                    onClick={() => addSkill('skills_frontend')}
                    className="text-green-600 hover:text-green-600"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="space-y-2">
                  {(cvData.cv.skills_frontend || []).map((skill, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={skill || ''}
                        onChange={(e) => updateSkill('skills_frontend', index, e.target.value)}
                        placeholder="Skill name"
                      />
                      <Button
                        size="sm"
                        onClick={() => removeSkill('skills_frontend', index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tools Skills */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Tools
                  </label>
                  <Button
                    size="sm"
                    onClick={() => addSkill('skills_tools')}
                    className="text-green-600 hover:text-green-600"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="space-y-2">
                  {(cvData.cv.skills_tools || []).map((skill, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={skill || ''}
                        onChange={(e) => updateSkill('skills_tools', index, e.target.value)}
                        placeholder="Tool name"
                      />
                      <Button
                        size="sm"
                        onClick={() => removeSkill('skills_tools', index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Methodologies/Practices */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Methodologies/Practices
                  </label>
                  <Button
                    size="sm"
                    onClick={() => addSkill('skills_backend')}
                    className="text-green-600 hover:text-green-600"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="space-y-2">
                  {(cvData.cv.skills_backend || []).map((skill, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={skill || ''}
                        onChange={(e) => updateSkill('skills_backend', index, e.target.value)}
                        placeholder="Skill name"
                      />
                      <Button
                        size="sm"
                        onClick={() => removeSkill('skills_backend', index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSavePersonalInfo}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Experience */}
      {activeSection === 'experience' && (
        <Card >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase size={20} />
              Work Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {(cvData?.experience || []).map((exp, index) => (
              <div key={exp.id} className="p-6 bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-xl shadow-[inset_-2px_-2px_1.5px_rgba(255,255,255,0.7),inset_2px_2px_1.5px_rgba(0,0,0,0.1)] border border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                    <Input
                      value={exp.title || ''}
                      onChange={(e) => updateExperience(index, 'title', e.target.value)}
                      placeholder="Senior Frontend Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                    <Input
                      value={exp.company || ''}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      placeholder="Tech Solutions Inc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Work Period</label>
                    <Input
                      value={exp.period || ''}
                      onChange={(e) => updateExperience(index, 'period', e.target.value)}
                      placeholder={`2020 - ${new Date().getFullYear()}`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`current-${exp.id}`}
                      checked={exp.is_current}
                      onChange={(e) => updateExperience(index, 'is_current', e.target.checked)}
                      className="rounded cursor-pointer"
                    />
                    <label htmlFor={`current-${exp.id}`} className="text-sm text-slate-700 cursor-pointer">
                      Current Position
                    </label>
                  </div>
                </div>
                <div className="mt-4">
                  <Textarea
                    value={exp.description || ''}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    placeholder="Description of responsibilities and achievements..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    size="sm"
                    onClick={() => removeExperience(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="flex justify-between">
              <Button
                onClick={addExperience}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Work Experience
              </Button>
              
              <Button
                onClick={handleSaveExperience}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {activeSection === 'education' && (
        <Card >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap size={20} />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {(cvData?.education || []).map((edu, index) => (
              <div key={edu.id} className="p-6 bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-xl shadow-[inset_-2px_-2px_1.5px_rgba(255,255,255,0.7),inset_2px_2px_1.5px_rgba(0,0,0,0.1)] border border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={edu.degree || ''}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    placeholder="Bachelor of Information Technology"
                  />
                  <Input
                    value={edu.institution || ''}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    placeholder="Lomonosov Moscow State University"
                  />
                  <Input
                    value={edu.period || ''}
                    onChange={(e) => updateEducation(index, 'period', e.target.value)}
                    placeholder={`2015 - ${new Date().getFullYear()}`}
                  />
                </div>
                <div className="mt-4">
                  <Textarea
                    value={edu.description || ''}
                    onChange={(e) => updateEducation(index, 'description', e.target.value)}
                    placeholder="Specialization, thesis, achievements..."
                    rows={2}
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    size="sm"
                    onClick={() => removeEducation(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="flex justify-between">
              <Button
                onClick={addEducation}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Education
              </Button>
              
              <Button
                onClick={handleSaveEducation}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Languages */}
      {activeSection === 'languages' && (
        <Card >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages size={20} />
              Languages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {(cvData?.languages || []).map((lang, index) => (
              <div key={lang.id} className="flex items-end gap-4 p-6 bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-xl shadow-[inset_-2px_-2px_1.5px_rgba(255,255,255,0.7),inset_2px_2px_1.5px_rgba(0,0,0,0.1)] border border-white/20">
                <div className="flex-1">
                  <Input
                    value={lang.language || ''}
                    onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                    placeholder="English"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    value={lang.level || ''}
                    onChange={(e) => updateLanguage(index, 'level', e.target.value)}
                    placeholder="B2 (Upper-Intermediate)"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => removeLanguage(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            
            <div className="flex justify-between">
              <Button
                onClick={addLanguage}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Language
              </Button>
              
              <Button
                onClick={handleSaveLanguages}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

