'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Bot, Save, Cpu } from 'lucide-react';
import { logger } from '@/lib/logger';
import { useToast } from '@/components/ui/ToastContainer';

interface AiSettings {
  chat_instructions: string;
  chat_extra: string;
  groq_model: string;
  gemini_model: string;
}

const EMPTY_SETTINGS: AiSettings = {
  chat_instructions: '',
  chat_extra: '',
  groq_model: '',
  gemini_model: '',
};

export default function AIAvatarEditor() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<AiSettings>(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/ai-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings({
          chat_instructions: data.chat_instructions || '',
          chat_extra: data.chat_extra || '',
          groq_model: data.groq_model || '',
          gemini_model: data.gemini_model || '',
        });
      } else {
        showToast('Failed to load AI settings', 'error');
      }
    } catch (error) {
      logger.error('Error loading AI settings:', error);
      showToast('Failed to load AI settings', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateField = (field: keyof AiSettings, value: string) => {
    setSettings((previous) => ({ ...previous, [field]: value }));
  };

  const handleSave = async () => {
    if (!settings.groq_model.trim() || !settings.gemini_model.trim()) {
      showToast('Model names cannot be empty', 'warning');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/ai-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await response.json();

      if (response.ok) {
        showToast('AI settings saved successfully!', 'success');
      } else {
        showToast(data.error || 'Error saving AI settings', 'error');
      }
    } catch (error) {
      logger.error('Error saving AI settings:', error);
      showToast('Error saving AI settings', 'error');
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">AI Avatar</h2>
      <p className="text-sm text-slate-600">
        Configure the chatbot persona, extra context and the models used for generation. The
        immutable security rules are always applied automatically and are not shown here.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot size={20} />
            Persona &amp; Context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            label="Persona & Rules"
            rows={12}
            value={settings.chat_instructions}
            onChange={(e) => updateField('chat_instructions', e.target.value)}
            placeholder="Tone, personality, positioning, honest boundaries, relocation details..."
          />

          <Textarea
            label="Additional Info (not in the resume)"
            rows={12}
            value={settings.chat_extra}
            onChange={(e) => updateField('chat_extra', e.target.value)}
            placeholder="Hobbies, maker stories, career anecdotes — anything you want the avatar to know that is not part of the resume."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu size={20} />
            Models
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            API keys stay in environment variables. Only the model names can be changed here.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Groq model"
              value={settings.groq_model}
              onChange={(e) => updateField('groq_model', e.target.value)}
              placeholder="openai/gpt-oss-20b"
            />
            <Input
              label="Google (Gemini) model"
              value={settings.gemini_model}
              onChange={(e) => updateField('gemini_model', e.target.value)}
              placeholder="gemini-3.5-flash-lite"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          {saving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Save size={16} />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
