'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { User, Briefcase, GraduationCap, Languages } from 'lucide-react';
import { logger } from '../../../lib/logger';
import { useToast } from '../../../components/ui/ToastContainer';
import { CVData, SkillCategory } from './types';
import PersonalInfoSection from './PersonalInfoSection';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import LanguagesSection from './LanguagesSection';

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
        const normalizedData = {
          ...data,
          experience: data.experience || [],
          education: data.education || [],
          languages: data.languages || [],
        };
        setCvData(normalizedData);
      } else {
        logger.error('Failed to fetch CV data');
      }
    } catch (error) {
      logger.error('Error fetching CV data:', error);
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
        [field]: value,
      },
    });
  };

  const updateSkills = (category: SkillCategory, skills: string[]) => {
    updatePersonalField(category, skills);
  };

  const addSkill = (category: SkillCategory) => {
    if (!cvData) return;
    const currentSkills = cvData.cv[category] || [];
    updateSkills(category, [...currentSkills, '']);
  };

  const removeSkill = (category: SkillCategory, index: number) => {
    if (!cvData) return;
    const currentSkills = cvData.cv[category] || [];
    updateSkills(
      category,
      currentSkills.filter((_, i) => i !== index),
    );
  };

  const updateSkill = (category: SkillCategory, index: number, value: string) => {
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
      id: Date.now(),
      title: '',
      company: '',
      period: '',
      description: '',
      is_current: false,
      sort_order: (cvData.experience || []).length,
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
        fetchCVData();
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
      id: Date.now(),
      degree: '',
      institution: '',
      period: '',
      description: '',
      sort_order: (cvData.education || []).length,
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
        fetchCVData();
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
      id: Date.now(),
      language: '',
      level: '',
      sort_order: (cvData.languages || []).length,
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
        fetchCVData();
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
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cvData) {
    return (
      <Card>
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
      <div className="mb-8 flex flex-wrap space-x-1 gap-y-1 rounded-xl bg-gradient-to-br from-[#e8edf2] to-[#dfe7ed] px-1 py-2 shadow-[4.5px_4.5px_9px_#c5c5c5,_-2.25px_-2.25px_9px_#ffffff,_inset_-2px_-2px_1.5px_#8a8a8acc]">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-[3px_3px_6px_#9ca3af,_-1.5px_-1.5px_6px_rgba(255,255,255,0.1)]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon size={16} />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Sections */}
      {activeSection === 'personal' && (
        <PersonalInfoSection
          cvData={cvData}
          saving={saving}
          onUpdateField={updatePersonalField}
          onUpdateCvData={setCvData}
          onAddSkill={addSkill}
          onRemoveSkill={removeSkill}
          onUpdateSkill={updateSkill}
          onSave={handleSavePersonalInfo}
        />
      )}

      {activeSection === 'experience' && (
        <ExperienceSection
          experience={cvData.experience || []}
          saving={saving}
          onUpdate={updateExperience}
          onAdd={addExperience}
          onRemove={removeExperience}
          onSave={handleSaveExperience}
        />
      )}

      {activeSection === 'education' && (
        <EducationSection
          education={cvData.education || []}
          saving={saving}
          onUpdate={updateEducation}
          onAdd={addEducation}
          onRemove={removeEducation}
          onSave={handleSaveEducation}
        />
      )}

      {activeSection === 'languages' && (
        <LanguagesSection
          languages={cvData.languages || []}
          saving={saving}
          onUpdate={updateLanguage}
          onAdd={addLanguage}
          onRemove={removeLanguage}
          onSave={handleSaveLanguages}
        />
      )}
    </div>
  );
}
