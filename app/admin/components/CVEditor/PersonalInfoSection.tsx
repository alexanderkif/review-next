import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import CommaSeparatedInput from '@/components/ui/CommaSeparatedInput';
import MultipleImageUpload from '@/components/ui/MultipleImageUpload';
import { Save, User } from 'lucide-react';
import { CVData } from './types';

interface PersonalInfoSectionProps {
  cvData: CVData;
  saving: boolean;
  onUpdateField: (field: keyof CVData['cv'], value: string | string[]) => void;
  onUpdateCvData: (data: CVData) => void;
  onSave: () => void;
}

export default function PersonalInfoSection({
  cvData,
  saving,
  onUpdateField,
  onUpdateCvData,
  onSave,
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Input
              label="Full Name"
              value={cvData.cv.name || ''}
              onChange={(e) => onUpdateField('name', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Position"
              value={cvData.cv.title || ''}
              onChange={(e) => onUpdateField('title', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Email"
              type="email"
              value={cvData.cv.email || ''}
              onChange={(e) => onUpdateField('email', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Phone"
              value={cvData.cv.phone || ''}
              onChange={(e) => onUpdateField('phone', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Location"
              value={cvData.cv.location || ''}
              onChange={(e) => onUpdateField('location', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Website"
              value={cvData.cv.website || ''}
              onChange={(e) => onUpdateField('website', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="GitHub URL"
              value={cvData.cv.github_url || ''}
              onChange={(e) => onUpdateField('github_url', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="LinkedIn URL"
              value={cvData.cv.linkedin_url || ''}
              onChange={(e) => onUpdateField('linkedin_url', e.target.value)}
            />
          </div>
        </div>

        {/* Avatar Upload */}
        <div>
          <div className="mb-2 text-sm font-medium text-slate-700">
            Profile Avatars
            <span className="mt-1 block text-xs text-slate-500">
              Upload multiple photos for avatar rotation (changes every 5 seconds)
            </span>
          </div>
          <MultipleImageUpload
            entityType="avatar"
            entityId={cvData.cv.id.toString()}
            value={parseAvatarUrls(cvData.cv.avatar_url)}
            onUpdate={(imageIds: string[]) => {
              onUpdateField('avatar_url', JSON.stringify(imageIds));
              onUpdateCvData({
                ...cvData,
                cv: { ...cvData.cv, avatar_url: JSON.stringify(imageIds) },
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
          <Textarea
            label="HIGHLIGHTS"
            rows={8}
            value={cvData.cv.about || ''}
            onChange={(e) => onUpdateField('about', e.target.value)}
            placeholder="Enter key highlights, one per line. Use • or - for bullet points:&#10;&#10;• Profound understanding of JavaScript/TypeScript, SPA/PWA, HTML/CSS/SCSS&#10;• Experience with Agile, Jira, Azure, CI/CD pipelines, WCAG, Accessibility&#10;• Professional experience in computer technologies, networks, programming&#10;• Strong skills in electronics. My hobby is Arduino&#10;• Bachelor's degree in informatics and computer engineering&#10;• Open to relocate"
          />
        </div>

        {/* Skills */}
        <div className="space-y-4">
          <CommaSeparatedInput
            label="Technologies"
            value={cvData.cv.skills_frontend || []}
            onChange={(values) => onUpdateField('skills_frontend', values)}
            placeholder="JavaScript, TypeScript, React, Next.js, HTML, CSS"
          />

          <CommaSeparatedInput
            label="Tools"
            value={cvData.cv.skills_tools || []}
            onChange={(values) => onUpdateField('skills_tools', values)}
            placeholder="Git, Docker, Jira, Figma, VS Code"
          />

          <CommaSeparatedInput
            label="Methodologies/Practices"
            value={cvData.cv.skills_backend || []}
            onChange={(values) => onUpdateField('skills_backend', values)}
            placeholder="Agile, Scrum, CI/CD, TDD, Code Review"
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onSave} disabled={saving} className="flex items-center gap-2">
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
