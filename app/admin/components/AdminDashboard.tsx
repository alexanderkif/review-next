'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import {
  User,
  FileText,
  FolderOpen,
  Settings,
  LogOut,
  Home,
  Edit3,
  Eye
} from 'lucide-react';
import { logger } from '../../lib/logger';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import CVEditor from './CVEditor';
import ProjectsEditor from './ProjectsEditor';
import AdminSettings from './AdminSettings';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface AdminDashboardProps {
  user: AdminUser | null;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = async () => {
    try {
      await signOut({
        callbackUrl: '/admin/login',
        redirect: true
      });
    } catch (error) {
      logger.error('Logout error:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'cv', label: 'Resume', icon: FileText },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8edf2] via-[#f0f4f8] to-[#dfe7ed]">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#e8edf2] via-[#f0f4f8] to-[#dfe7ed] backdrop-blur-md shadow-[0_1.5px_4.5px_rgba(199,206,212,0.3),_inset_0_-2px_1.5px_#8a8a8acc] border-b border-slate-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Settings className="text-white" size={18} />
              </div>
              <h1 className="text-xl font-semibold text-slate-800 hidden md:block">
                Admin Panel
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="px-4 py-2.5 rounded-xl font-medium text-sm transition-colors duration-200 inline-flex items-center gap-2 cursor-pointer bg-gradient-to-br from-[#e8edf2] to-[#dfe7ed] text-slate-800 shadow-[3px_3px_6px_#c5c5c5,_-1.5px_-1.5px_6px_#ffffff,_inset_-2px_-2px_1px_#8a8a8acc] hover:text-emerald-600 hover:[background:linear-gradient(135deg,#edf2f7_0%,#e5ecf1_100%)]"
              >
                <Eye size={16} />
                <span className="md:hidden">Site</span>
                <span className="hidden md:inline">View Site</span>
              </Link>

              <div className="flex items-center gap-2 text-sm">
                <User size={16} className="text-slate-500" />
                <span className="text-slate-700 truncate max-w-[150px]">{user?.name || user?.email}</span>
              </div>

              <Button
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <LogOut size={16} />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap space-x-1 bg-gradient-to-br from-[#e8edf2] to-[#dfe7ed] px-1 py-2 rounded-xl shadow-[4.5px_4.5px_9px_#c5c5c5,_-2.25px_-2.25px_9px_#ffffff,_inset_-2px_-2px_1.5px_#8a8a8acc] mb-8 gap-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-[3px_3px_6px_#9ca3af,_-1.5px_-1.5px_6px_rgba(255,255,255,0.1)]'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="text-blue-600" size={20} />
                    Resume
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <p className="text-slate-600 text-sm mb-4 flex-1">
                    Manage resume data, work experience and skills
                  </p>
                  <Button
                    onClick={() => setActiveTab('cv')}
                    className="w-full mt-auto"
                  >
                    <Edit3 size={16} className="mr-2" />
                    Edit
                  </Button>
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FolderOpen className="text-green-600" size={20} />
                    Projects
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <p className="text-slate-600 text-sm mb-4 flex-1">
                    Add and edit portfolio projects
                  </p>
                  <Button
                    onClick={() => setActiveTab('projects')}
                    className="w-full mt-auto"
                  >
                    <FolderOpen size={16} className="mr-2" />
                    Manage
                  </Button>
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="text-purple-600" size={20} />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <p className="text-slate-600 text-sm mb-4 flex-1">
                    General site and account settings
                  </p>
                  <Button
                    onClick={() => setActiveTab('settings')}
                    className="w-full mt-auto"
                  >
                    <Settings size={16} className="mr-2" />
                    Configure
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'cv' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Resume Management</h2>
              </div>

              <CVEditor />
            </div>
          )}

          {activeTab === 'projects' && (
            <ProjectsEditor />
          )}

          {activeTab === 'settings' && user && (
            <AdminSettings user={user} />
          )}
        </div>
      </div>
    </div>
  );
}
