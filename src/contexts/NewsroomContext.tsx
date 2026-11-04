import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Organization,
  Department,
  Story,
  StoryStatus,
  MediaAsset,
  CalendarEvent,
  NotificationItem,
  AuditLogItem,
  TranscriptItem,
  TranslationItem,
  EditorialComment,
  StoryVersion,
} from '../types';
import {
  INITIAL_ORGANIZATIONS,
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_STORIES,
  INITIAL_MEDIA_ASSETS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_TRANSCRIPTS,
  INITIAL_TRANSLATIONS,
} from '../data/seedData';

interface AIRequestOptions {
  prompt: string;
  systemInstruction?: string;
  tone?: string;
  taskType?: string;
  context?: string;
}

interface NewsroomContextType {
  // Current session & Multi-tenancy
  currentOrg: Organization;
  currentUser: User;
  allOrganizations: Organization[];
  allUsers: User[];
  isDemoMode: boolean;
  switchOrganization: (orgId: string) => void;
  switchUserRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;

  // Filtered collections for current organisation
  departments: Department[];
  stories: Story[];
  mediaAssets: MediaAsset[];
  calendarEvents: CalendarEvent[];
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  auditLogs: AuditLogItem[];
  transcripts: TranscriptItem[];
  translations: TranslationItem[];

  // CRUD operations
  createStory: (story: Omit<Story, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'wordCount'>) => Story;
  updateStory: (id: string, updates: Partial<Story>) => void;
  deleteStory: (id: string) => void;
  transitionStoryStatus: (id: string, newStatus: StoryStatus, note?: string) => void;
  addEditorialComment: (storyId: string, content: string, isRevisionRequest?: boolean) => void;
  saveStoryVersion: (storyId: string) => void;

  // Department operations
  createDepartment: (dept: Omit<Department, 'id' | 'organizationId'>) => Department;
  updateDepartment: (id: string, updates: Partial<Department>) => void;

  // Organization operations
  createOrganization: (org: Omit<Organization, 'id' | 'createdAt'>) => Organization;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;

  // Media operations
  addMediaAsset: (asset: Omit<MediaAsset, 'id' | 'organizationId' | 'createdAt'>) => MediaAsset;
  deleteMediaAsset: (id: string) => void;

  // Calendar operations
  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'organizationId'>) => CalendarEvent;
  deleteCalendarEvent: (id: string) => void;

  // Transcripts & Translations
  addTranscript: (item: Omit<TranscriptItem, 'id' | 'organizationId' | 'createdAt'>) => TranscriptItem;
  addTranslation: (item: Omit<TranslationItem, 'id' | 'organizationId' | 'createdAt'>) => TranslationItem;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // AI assistant integration
  generateAI: (options: AIRequestOptions) => Promise<string>;
  transcribeAudioAI: (data: { audioBase64?: string; mimeType?: string; language: string; interviewTitle: string; notes?: string }) => Promise<{ transcript: string; summary?: string }>;
  translateAI: (data: { text: string; sourceLang: string; targetLang: string; contentType?: string }) => Promise<{ translation: string; notes: string }>;

  // Authentication
  isAuthenticated: boolean;
  login: (username: string, password: string, selectedUserId?: string) => { success: boolean; error?: string };
  logout: () => void;

  // Audit and demo utilities
  resetDemoData: () => void;
  hasPermission: (action: string) => boolean;
}

const NewsroomContext = createContext<NewsroomContextType | undefined>(undefined);

const STORAGE_KEYS = {
  AUTH: 'sn_zim_auth_v1',
  ORGS: 'sn_zim_orgs_v1',
  USERS: 'sn_zim_users_v1',
  DEPTS: 'sn_zim_depts_v1',
  STORIES: 'sn_zim_stories_v1',
  MEDIA: 'sn_zim_media_v1',
  CALENDAR: 'sn_zim_calendar_v1',
  NOTIFS: 'sn_zim_notifs_v1',
  AUDIT: 'sn_zim_audit_v1',
  TRANSCRIPTS: 'sn_zim_transcripts_v1',
  TRANSLATIONS: 'sn_zim_translations_v1',
  CURRENT_ORG_ID: 'sn_zim_current_org_id_v1',
  CURRENT_USER_ID: 'sn_zim_current_user_id_v1',
};

function loadStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage`, e);
    return defaultValue;
  }
}

export const NewsroomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>(() =>
    loadStored(STORAGE_KEYS.ORGS, INITIAL_ORGANIZATIONS)
  );
  const [users, setUsers] = useState<User[]>(() =>
    loadStored(STORAGE_KEYS.USERS, INITIAL_USERS)
  );
  const [departments, setDepartments] = useState<Department[]>(() =>
    loadStored(STORAGE_KEYS.DEPTS, INITIAL_DEPARTMENTS)
  );
  const [stories, setStories] = useState<Story[]>(() =>
    loadStored(STORAGE_KEYS.STORIES, INITIAL_STORIES)
  );
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(() =>
    loadStored(STORAGE_KEYS.MEDIA, INITIAL_MEDIA_ASSETS)
  );
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() =>
    loadStored(STORAGE_KEYS.CALENDAR, INITIAL_CALENDAR_EVENTS)
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadStored(STORAGE_KEYS.NOTIFS, INITIAL_NOTIFICATIONS)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() =>
    loadStored(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS)
  );
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>(() =>
    loadStored(STORAGE_KEYS.TRANSCRIPTS, INITIAL_TRANSCRIPTS)
  );
  const [translations, setTranslations] = useState<TranslationItem[]>(() =>
    loadStored(STORAGE_KEYS.TRANSLATIONS, INITIAL_TRANSLATIONS)
  );

  const [currentOrgId, setCurrentOrgId] = useState<string>(() =>
    loadStored(STORAGE_KEYS.CURRENT_ORG_ID, 'org_byo_digital')
  );
  const [currentUserId, setCurrentUserId] = useState<string>(() =>
    loadStored(STORAGE_KEYS.CURRENT_USER_ID, 'user_editor_in_chief')
  );

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    loadStored(STORAGE_KEYS.AUTH, false)
  );

  const isDemoMode = true; // Prototype is seeded with complete realistic demo data & toggle

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORGS, JSON.stringify(organizations));
  }, [organizations]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPTS, JSON.stringify(departments));
  }, [departments]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
  }, [stories]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(mediaAssets));
  }, [mediaAssets]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(calendarEvents));
  }, [calendarEvents]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSCRIPTS, JSON.stringify(transcripts));
  }, [transcripts]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSLATIONS, JSON.stringify(translations));
  }, [translations]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ORG_ID, JSON.stringify(currentOrgId));
  }, [currentOrgId]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, JSON.stringify(currentUserId));
  }, [currentUserId]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  // Active Organisation and User resolution
  const currentOrg =
    organizations.find((o) => o.id === currentOrgId) || organizations[0] || INITIAL_ORGANIZATIONS[0];

  const currentUser =
    users.find((u) => u.id === currentUserId) || users[0] || INITIAL_USERS[2];

  // Multi-tenant strict filtering: only records matching current organisation ID
  const filteredDepartments = departments.filter((d) => d.organizationId === currentOrg.id);
  const filteredStories = stories.filter((s) => s.organizationId === currentOrg.id);
  const filteredMediaAssets = mediaAssets.filter((m) => m.organizationId === currentOrg.id);
  const filteredCalendarEvents = calendarEvents.filter((c) => c.organizationId === currentOrg.id);
  const filteredTranscripts = transcripts.filter((t) => t.organizationId === currentOrg.id);
  const filteredTranslations = translations.filter((t) => t.organizationId === currentOrg.id);
  const filteredAuditLogs = auditLogs.filter(
    (a) => a.organizationId === currentOrg.id || currentUser.role === 'platform_admin'
  );
  const filteredNotifications = notifications.filter(
    (n) => n.organizationId === currentOrg.id && (n.recipientUserId === currentUser.id || currentUser.role === 'platform_admin' || currentUser.role === 'editor_in_chief')
  );

  const unreadNotificationsCount = filteredNotifications.filter((n) => !n.read).length;

  // Multi-tenant Org Switching
  const switchOrganization = (orgId: string) => {
    setCurrentOrgId(orgId);
    // Find a sensible default user in that org or retain platform admin
    if (currentUser.role !== 'platform_admin') {
      const orgUser = users.find((u) => u.organizationId === orgId);
      if (orgUser) {
        setCurrentUserId(orgUser.id);
      }
    }
    logAudit('SWITCH_ORGANIZATION', 'organization', orgId, orgId, `Switched active workspace to ${orgId}`);
  };

  // Switch Role
  const switchUserRole = (targetRole: UserRole) => {
    // Check if an existing user matches that role in the current org
    const matchInOrg = users.find((u) => u.organizationId === currentOrg.id && u.role === targetRole);
    if (matchInOrg) {
      setCurrentUserId(matchInOrg.id);
    } else {
      // Find anywhere or update current user role
      const anyUser = users.find((u) => u.role === targetRole);
      if (anyUser) {
        setCurrentUserId(anyUser.id);
        setCurrentOrgId(anyUser.organizationId);
      } else {
        // Mutate current user role for testing
        setUsers((prev) =>
          prev.map((u) => (u.id === currentUser.id ? { ...u, role: targetRole } : u))
        );
      }
    }
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(target.id);
      setCurrentOrgId(target.organizationId);
    }
  };

  // Audit Logger Helper
  const logAudit = (
    action: string,
    entityType: 'story' | 'user' | 'department' | 'organization' | 'media' | 'ai' | 'publishing',
    entityId: string,
    entityTitle: string,
    details: string
  ) => {
    const newLog: AuditLogItem = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: currentOrg.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      entityTitle,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Permission Checker
  const hasPermission = (action: string): boolean => {
    const role = currentUser.role;
    if (role === 'platform_admin') return true;

    switch (action) {
      case 'create_org':
      case 'view_platform_settings':
        return false;
      case 'manage_org_settings':
      case 'create_department':
      case 'manage_users':
        return role === 'org_admin';
      case 'approve_story':
      case 'reject_story':
      case 'request_revision':
        return role === 'editor_in_chief' || role === 'section_editor' || role === 'org_admin';
      case 'publish_story':
        return role === 'editor_in_chief' || role === 'org_admin';
      case 'assign_story':
        return (
          role === 'editor_in_chief' ||
          role === 'section_editor' ||
          role === 'org_admin'
        );
      case 'write_article':
      case 'submit_story':
        return role === 'journalist' || role === 'section_editor' || role === 'editor_in_chief' || role === 'org_admin' || role === 'multimedia_producer';
      case 'upload_media':
        return role !== 'viewer';
      case 'use_ai':
        return role !== 'viewer';
      default:
        return true;
    }
  };

  // Story CRUD
  const createStory = (
    storyData: Omit<Story, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'wordCount'>
  ): Story => {
    const id = `story_${Date.now()}`;
    const wordCount = storyData.content ? storyData.content.trim().split(/\s+/).length : 0;
    const now = new Date().toISOString();

    const newStory: Story = {
      ...storyData,
      id,
      organizationId: currentOrg.id,
      wordCount,
      createdAt: now,
      updatedAt: now,
      comments: [],
      versions: [
        {
          id: `ver_${Date.now()}`,
          storyId: id,
          title: storyData.title,
          content: storyData.content,
          summary: storyData.summary,
          savedByUserId: currentUser.id,
          savedByUserName: currentUser.name,
          savedAt: now,
          versionNumber: 1,
        },
      ],
    };

    setStories((prev) => [newStory, ...prev]);
    logAudit('CREATE_STORY', 'story', id, newStory.title, `Created story in department ${newStory.departmentId}`);

    // Create notification if assigned
    if (newStory.assignedToUserId && newStory.assignedToUserId !== currentUser.id) {
      createNotification(
        newStory.assignedToUserId,
        'New Story Assigned',
        `You have been assigned to work on: "${newStory.title}"`,
        'assignment',
        id
      );
    }

    return newStory;
  };

  const updateStory = (id: string, updates: Partial<Story>) => {
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newContent = updates.content !== undefined ? updates.content : s.content;
        const wordCount = newContent ? newContent.trim().split(/\s+/).length : s.wordCount;
        return {
          ...s,
          ...updates,
          wordCount,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    const target = stories.find((s) => s.id === id);
    if (target) {
      logAudit('UPDATE_STORY', 'story', id, target.title, `Updated fields on story`);
    }
  };

  const deleteStory = (id: string) => {
    const target = stories.find((s) => s.id === id);
    if (target) {
      setStories((prev) => prev.filter((s) => s.id !== id));
      logAudit('DELETE_STORY', 'story', id, target.title, `Deleted story from newsroom`);
    }
  };

  const transitionStoryStatus = (id: string, newStatus: StoryStatus, note?: string) => {
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const now = new Date().toISOString();
        const updates: Partial<Story> = {
          status: newStatus,
          updatedAt: now,
        };
        if (newStatus === 'published' && !s.publishedAt) {
          updates.publishedAt = now;
        }
        return { ...s, ...updates };
      })
    );

    const target = stories.find((s) => s.id === id);
    if (target) {
      logAudit(
        `STATUS_CHANGE_${newStatus.toUpperCase()}`,
        'story',
        id,
        target.title,
        `Workflow transitioned from ${target.status} to ${newStatus}${note ? `: ${note}` : ''}`
      );

      // Trigger contextual notifications
      if (newStatus === 'submitted' && target.assignedEditorId) {
        createNotification(
          target.assignedEditorId,
          'Story Submitted for Review',
          `"${target.title}" submitted by ${currentUser.name} for editorial approval.`,
          'submission',
          id
        );
      } else if (newStatus === 'approved' && target.assignedToUserId) {
        createNotification(
          target.assignedToUserId,
          'Story Approved!',
          `Your article "${target.title}" has been approved by the editorial desk.`,
          'approval',
          id
        );
      } else if (newStatus === 'revision_required' && target.assignedToUserId) {
        createNotification(
          target.assignedToUserId,
          'Revision Requested',
          `Revisions requested on "${target.title}": ${note || 'Please review editor comments.'}`,
          'revision',
          id
        );
      } else if (newStatus === 'published') {
        createNotification(
          target.authorId,
          'Article Published Live',
          `"${target.title}" has been marked published across scheduled destinations.`,
          'published',
          id
        );
      }
    }
  };

  const addEditorialComment = (storyId: string, content: string, isRevisionRequest: boolean = false) => {
    const newComment: EditorialComment = {
      id: `comm_${Date.now()}`,
      storyId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content,
      createdAt: new Date().toISOString(),
      isRevisionRequest,
    };

    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;
        const currentComments = s.comments || [];
        return {
          ...s,
          comments: [...currentComments, newComment],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    const target = stories.find((s) => s.id === storyId);
    if (target && target.assignedToUserId && target.assignedToUserId !== currentUser.id) {
      createNotification(
        target.assignedToUserId,
        isRevisionRequest ? 'Revision Feedback from Editor' : 'New Editorial Comment',
        `Comment on "${target.title}": "${content.slice(0, 80)}..."`,
        'comment',
        storyId
      );
    }
  };

  const saveStoryVersion = (storyId: string) => {
    const target = stories.find((s) => s.id === storyId);
    if (!target) return;

    const existingVersions = target.versions || [];
    const newVersion: StoryVersion = {
      id: `ver_${Date.now()}`,
      storyId,
      title: target.title,
      content: target.content,
      summary: target.summary,
      savedByUserId: currentUser.id,
      savedByUserName: currentUser.name,
      savedAt: new Date().toISOString(),
      versionNumber: existingVersions.length + 1,
    };

    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, versions: [...existingVersions, newVersion] } : s))
    );
  };

  const createNotification = (
    recipientUserId: string,
    title: string,
    message: string,
    type: NotificationItem['type'],
    storyId?: string
  ) => {
    const item: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: currentOrg.id,
      recipientUserId,
      title,
      message,
      type,
      storyId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [item, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Department CRUD
  const createDepartment = (deptData: Omit<Department, 'id' | 'organizationId'>): Department => {
    const id = `dept_${Date.now()}`;
    const newDept: Department = {
      ...deptData,
      id,
      organizationId: currentOrg.id,
    };
    setDepartments((prev) => [...prev, newDept]);
    logAudit('CREATE_DEPARTMENT', 'department', id, newDept.name, `Created department ${newDept.code}`);
    return newDept;
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  // Organization CRUD
  const createOrganization = (orgData: Omit<Organization, 'id' | 'createdAt'>): Organization => {
    const id = `org_${Date.now()}`;
    const newOrg: Organization = {
      ...orgData,
      id,
      createdAt: new Date().toISOString(),
    };
    setOrganizations((prev) => [...prev, newOrg]);
    logAudit('CREATE_ORGANIZATION', 'organization', id, newOrg.name, `Registered new media organisation`);
    return newOrg;
  };

  const updateOrganization = (id: string, updates: Partial<Organization>) => {
    setOrganizations((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  };

  // Media CRUD
  const addMediaAsset = (assetData: Omit<MediaAsset, 'id' | 'organizationId' | 'createdAt'>): MediaAsset => {
    const id = `media_${Date.now()}`;
    const newAsset: MediaAsset = {
      ...assetData,
      id,
      organizationId: currentOrg.id,
      createdAt: new Date().toISOString(),
    };
    setMediaAssets((prev) => [newAsset, ...prev]);
    logAudit('UPLOAD_MEDIA', 'media', id, newAsset.name, `Uploaded ${newAsset.type} asset`);
    return newAsset;
  };

  const deleteMediaAsset = (id: string) => {
    setMediaAssets((prev) => prev.filter((m) => m.id !== id));
  };

  // Calendar CRUD
  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id' | 'organizationId'>): CalendarEvent => {
    const id = `cal_${Date.now()}`;
    const newEvent: CalendarEvent = {
      ...eventData,
      id,
      organizationId: currentOrg.id,
    };
    setCalendarEvents((prev) => [...prev, newEvent]);
    return newEvent;
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents((prev) => prev.filter((c) => c.id !== id));
  };

  // Transcripts & Translations
  const addTranscript = (itemData: Omit<TranscriptItem, 'id' | 'organizationId' | 'createdAt'>): TranscriptItem => {
    const id = `trans_${Date.now()}`;
    const newItem: TranscriptItem = {
      ...itemData,
      id,
      organizationId: currentOrg.id,
      createdAt: new Date().toISOString(),
    };
    setTranscripts((prev) => [newItem, ...prev]);
    logAudit('CREATE_TRANSCRIPT', 'ai', id, newItem.title, `Transcribed audio file: ${newItem.audioFileName}`);
    return newItem;
  };

  const addTranslation = (itemData: Omit<TranslationItem, 'id' | 'organizationId' | 'createdAt'>): TranslationItem => {
    const id = `translat_${Date.now()}`;
    const newItem: TranslationItem = {
      ...itemData,
      id,
      organizationId: currentOrg.id,
      createdAt: new Date().toISOString(),
    };
    setTranslations((prev) => [newItem, ...prev]);
    logAudit('CREATE_TRANSLATION', 'ai', id, newItem.title, `Translated from ${newItem.sourceLang} to ${newItem.targetLang}`);
    return newItem;
  };

  // AI Assistant Server Calls
  const generateAI = async (options: AIRequestOptions): Promise<string> => {
    const response = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate AI response');
    }

    logAudit('AI_TOOL_USAGE', 'ai', 'gemini', options.taskType || 'Editorial Assistant', `Prompt: ${options.prompt.slice(0, 60)}...`);
    return data.text || '';
  };

  const transcribeAudioAI = async (data: {
    audioBase64?: string;
    mimeType?: string;
    language: string;
    interviewTitle: string;
    notes?: string;
  }): Promise<{ transcript: string; summary?: string }> => {
    const response = await fetch('/api/gemini/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to process audio transcription');
    }

    return {
      transcript: result.transcript,
      summary: `Transcribed in ${result.language || 'English'}`,
    };
  };

  const translateAI = async (data: {
    text: string;
    sourceLang: string;
    targetLang: string;
    contentType?: string;
  }): Promise<{ translation: string; notes: string }> => {
    const response = await fetch('/api/gemini/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to process translation');
    }

    return {
      translation: result.translation,
      notes: result.notes,
    };
  };

  // Authentication Logic
  const login = (
    username: string,
    password: string,
    selectedUserId?: string
  ): { success: boolean; error?: string } => {
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (trimmedUser === 'admin' && trimmedPass === 'admin') {
      setIsAuthenticated(true);
      if (selectedUserId) {
        const target = users.find((u) => u.id === selectedUserId);
        if (target) {
          setCurrentUserId(target.id);
          setCurrentOrgId(target.organizationId);
        }
      } else {
        const defaultAdmin = users.find((u) => u.role === 'platform_admin') || users[0];
        if (defaultAdmin) {
          setCurrentUserId(defaultAdmin.id);
          setCurrentOrgId(defaultAdmin.organizationId);
        }
      }
      logAudit('USER_LOGIN', 'user', currentUser.id, trimmedUser, 'Authenticated successfully with admin credentials');
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid username or password. Please use username: admin and password: admin',
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    logAudit('USER_LOGOUT', 'user', currentUser.id, currentUser.name, 'User signed out of newsroom');
  };

  // Reset Demo Data
  const resetDemoData = () => {
    localStorage.clear();
    setOrganizations(INITIAL_ORGANIZATIONS);
    setUsers(INITIAL_USERS);
    setDepartments(INITIAL_DEPARTMENTS);
    setStories(INITIAL_STORIES);
    setMediaAssets(INITIAL_MEDIA_ASSETS);
    setCalendarEvents(INITIAL_CALENDAR_EVENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setTranscripts(INITIAL_TRANSCRIPTS);
    setTranslations(INITIAL_TRANSLATIONS);
    setCurrentOrgId('org_byo_digital');
    setCurrentUserId('user_editor_in_chief');
    setIsAuthenticated(true);
  };

  return (
    <NewsroomContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        currentOrg,
        currentUser,
        allOrganizations: organizations,
        allUsers: users,
        isDemoMode,
        switchOrganization,
        switchUserRole,
        switchUser,

        departments: filteredDepartments,
        stories: filteredStories,
        mediaAssets: filteredMediaAssets,
        calendarEvents: filteredCalendarEvents,
        notifications: filteredNotifications,
        unreadNotificationsCount,
        auditLogs: filteredAuditLogs,
        transcripts: filteredTranscripts,
        translations: filteredTranslations,

        createStory,
        updateStory,
        deleteStory,
        transitionStoryStatus,
        addEditorialComment,
        saveStoryVersion,

        createDepartment,
        updateDepartment,

        createOrganization,
        updateOrganization,

        addMediaAsset,
        deleteMediaAsset,

        addCalendarEvent,
        deleteCalendarEvent,

        addTranscript,
        addTranslation,

        markNotificationRead,
        markAllNotificationsRead,

        generateAI,
        transcribeAudioAI,
        translateAI,

        resetDemoData,
        hasPermission,
      }}
    >
      {children}
    </NewsroomContext.Provider>
  );
};

export const useNewsroom = () => {
  const context = useContext(NewsroomContext);
  if (!context) {
    throw new Error('useNewsroom must be used within a NewsroomProvider');
  }
  return context;
};
