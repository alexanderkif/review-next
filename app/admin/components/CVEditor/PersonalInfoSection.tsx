import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input, Textarea } from '../../../components/ui/Input';
import MultipleImageUpload from '../../../components/ui/MultipleImageUpload';
import { Save, User } from 'lucide-react';
import { CVData, SkillCategory } from './types';
import SkillsGroup from './SkillsGroup';

interface PersonalInfoSectionProps {
  cvData: CVData;
  saving: boolean;
  onUpdateField: (field: keyof CVData['cv'], value: string | string[]) => void;
  onUpdateCvData: (data: CVData) => void;
  onAddSkill: (category: SkillCategory) => void;
  onRemoveSkill: (category: SkillCategory, index: number) => void;
  onUpdateSkill: (category: SkillCategory, index: number, value: string) => void;
  onSave: () => void;
}

export default function PersonalInfoSection({
  cvData,
  saving,
  onUpdateField,
  onUpdateCvData,
  onAddSkill,
  onRemoveSkill,
  onUpdateSkill,
  onSave
}: PersonalInfoSectionProps) {
  const parseAvatarUrls = (avatarUrl: string): string[] => {
    if (!avatarUrl || avatarUrl === '[]' || avatarUrl === '') return [];
    try {
      return Array.isArray(avatarUrl) ? avatarUrl : JSON.parse(avatarUrl);
    } catch {
      return [avatarUrl];
    }
  };

  return (
    <Card>
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
              onChange={(e) => onUpdateField('name', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Position
            </label>
            <Input
              value={cvData.cv.title || ''}
              onChange={(e) => onUpdateField('title', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={cvData.cv.email || ''}
              onChange={(e) => onUpdateField('email', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone
            </label>
            <Input
              value={cvData.cv.phone || ''}
              onChange={(e) => onUpdateField('phone', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Location
            </label>
            <Input
              value={cvData.cv.location || ''}
              onChange={(e) => onUpdateField('location', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Website
            </label>
            <Input
              value={cvData.cv.website || ''}
              onChange={(e) => onUpdateField('website', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              GitHub URL
            </label>
            <Input
              value={cvData.cv.github_url || ''}
              onChange={(e) => onUpdateField('github_url', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              LinkedIn URL
            </label>
            <Input
              value={cvData.cv.linkedin_url || ''}
              onChange={(e) => onUpdateField('linkedin_url', e.target.value)}
            />
          </div>
        </div>

        {/* Avatar Upload */}
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
            value={parseAvatarUrls(cvData.cv.avatar_url)}
            onUpdate={(imageIds: string[]) => {
              onUpdateField('avatar_url', JSON.stringify(imageIds));
              onUpdateCvData({
                ...cvData,
                cv: { ...cvData.cv, avatar_url: JSON.stringify(imageIds) }
              });
            }}
            maxImages={5}
            maxSize={1}
            placeholder="Upload avatar photos"
            className=""
            isAvatar={true}
          />
        </div>

        {/* Highlights */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            HIGHLIGHTS
          </label>
          <Textarea
            rows={8}
            value={cvData.cv.about || ''}
            onChange={(e) => onUpdateField('about', e.target.value)}
            placeholder="Enter key highlights, one per line. Use • or - for bullet points:&#10;&#10;• Profound understanding of JavaScript/TypeScript, SPA/PWA, HTML/CSS/SCSS&#10;• Experience with Agile, Jira, Azure, CI/CD pipelines, WCAG, Accessibility&#10;• Professional experience in computer technologies, networks, programming&#10;• Strong skills in electronics. My hobby is Arduino&#10;• Bachelor's degree in informatics and computer engineering&#10;• Open to relocate"
          />
        </div>

        {/* Skills */}
        <div className="space-y-6">
          <SkillsGroup
            label="Technologies"
            category="skills_frontend"
            skills={cvData.cv.skills_frontend || []}
            onAdd={onAddSkill}
            onRemove={onRemoveSkill}
            onUpdate={onUpdateSkill}
          />

          <SkillsGroup
            label="Tools"
            category="skills_tools"
            skills={cvData.cv.skills_tools || []}
            onAdd={onAddSkill}
            onRemove={onRemoveSkill}
            onUpdate={onUpdateSkill}
            placeholder="Tool name"
          />

          <SkillsGroup
            label="Methodologies/Practices"
            category="skills_backend"
            skills={cvData.cv.skills_backend || []}
            onAdd={onAddSkill}
            onRemove={onRemoveSkill}
            onUpdate={onUpdateSkill}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={onSave}
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
  );
}
