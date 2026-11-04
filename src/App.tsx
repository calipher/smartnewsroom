import React, { useState } from 'react';
import { NewsroomProvider, useNewsroom } from './contexts/NewsroomContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { NewStoryModal } from './components/stories/NewStoryModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { NewsroomPage } from './pages/NewsroomPage';
import { StoriesPage } from './pages/StoriesPage';
import { ArticleEditorPage } from './pages/ArticleEditorPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { TranscriptionStudioPage } from './pages/TranscriptionStudioPage';
import { TranslationStudioPage } from './pages/TranslationStudioPage';
import { MultimediaLibraryPage } from './pages/MultimediaLibraryPage';
import { EditorialCalendarPage } from './pages/EditorialCalendarPage';
import { PublishingCentrePage } from './pages/PublishingCentrePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { OrganizationSettingsPage } from './pages/OrganizationSettingsPage';
import { AuditSecurityPage } from './pages/AuditSecurityPage';
import { LoginPage } from './pages/LoginPage';

const NewsroomApp: React.FC = () => {
  const { currentOrg, currentUser, isAuthenticated } = useNewsroom();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNewStoryModalOpen, setIsNewStoryModalOpen] = useState(false);
  const [activeStoryId, setActiveStoryId] = useState<string | undefined>(undefined);
  const [filterDepartmentId, setFilterDepartmentId] = useState<string | undefined>(undefined);

  // If not authenticated, display login screen
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleSelectStory = (storyId: string) => {
    setActiveStoryId(storyId);
    setCurrentTab('editor');
  };

  const handleSelectDepartmentStories = (deptId: string) => {
    setFilterDepartmentId(deptId);
    setCurrentTab('stories');
  };

  const handleOpenEditorWithContent = (title: string, content: string, category: string) => {
    setCurrentTab('editor');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'stories') setFilterDepartmentId(undefined);
        }}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main View Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNav
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenNewStoryModal={() => setIsNewStoryModalOpen(true)}
          onSelectStory={handleSelectStory}
        />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {currentTab === 'dashboard' && (
              <DashboardPage
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onSelectStory={handleSelectStory}
                onOpenNewStory={() => setIsNewStoryModalOpen(true)}
              />
            )}

            {currentTab === 'newsroom' && (
              <NewsroomPage onSelectDepartmentStories={handleSelectDepartmentStories} />
            )}

            {currentTab === 'assignments' && (
              <StoriesPage
                onSelectStory={handleSelectStory}
                onOpenNewStory={() => setIsNewStoryModalOpen(true)}
              />
            )}

            {currentTab === 'stories' && (
              <StoriesPage
                onSelectStory={handleSelectStory}
                onOpenNewStory={() => setIsNewStoryModalOpen(true)}
                filterDepartmentId={filterDepartmentId}
              />
            )}

            {currentTab === 'editor' && (
              <ArticleEditorPage
                storyId={activeStoryId}
                onBackToStories={() => setCurrentTab('stories')}
              />
            )}

            {currentTab === 'ai_studio' && (
              <AIAssistantPage
                onOpenArticleEditorWithContent={(title, content, category) => {
                  setCurrentTab('editor');
                }}
              />
            )}

            {currentTab === 'transcription' && (
              <TranscriptionStudioPage
                onSendToArticleEditor={(title, content) => {
                  setCurrentTab('editor');
                }}
              />
            )}

            {currentTab === 'translation' && (
              <TranslationStudioPage
                onSendToArticleEditor={(title, content) => {
                  setCurrentTab('editor');
                }}
              />
            )}

            {currentTab === 'multimedia' && <MultimediaLibraryPage />}

            {currentTab === 'calendar' && <EditorialCalendarPage />}

            {currentTab === 'publishing' && <PublishingCentrePage />}

            {currentTab === 'analytics' && <AnalyticsPage />}

            {currentTab === 'users' && <UserManagementPage />}

            {currentTab === 'settings' && <OrganizationSettingsPage />}

            {currentTab === 'security' && <AuditSecurityPage />}
          </div>
        </main>
      </div>

      {/* Global New Story Assignment Modal */}
      <NewStoryModal
        isOpen={isNewStoryModalOpen}
        onClose={() => setIsNewStoryModalOpen(false)}
        onCreated={(storyId) => {
          setActiveStoryId(storyId);
          setCurrentTab('editor');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <NewsroomProvider>
      <NewsroomApp />
    </NewsroomProvider>
  );
}
