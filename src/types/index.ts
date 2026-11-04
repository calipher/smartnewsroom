export type UserRole =
  | 'platform_admin'
  | 'org_admin'
  | 'editor_in_chief'
  | 'section_editor'
  | 'journalist'
  | 'multimedia_producer'
  | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  departmentId?: string;
  avatarUrl?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
}

export type OrgType =
  | 'radio'
  | 'television'
  | 'newspaper'
  | 'online_publisher'
  | 'community_media'
  | 'multimedia_production';

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  address: string;
  province: string;
  city: string;
  email: string;
  phone: string;
  website: string;
  logoUrl?: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  settings?: {
    defaultTimezone: string;
    currency: 'USD' | 'ZWG';
    aiRetentionAllowed: boolean;
    autoArchiveDays: number;
  };
}

export interface Department {
  id: string;
  name: string;
  code: string;
  organizationId: string;
  headUserId: string;
  description: string;
  storyTargetMonthly: number;
}

export type StoryStatus =
  | 'proposed'
  | 'assigned'
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'revision_required'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'archived';

export type StoryPriority = 'urgent' | 'high' | 'normal' | 'low';

export type StoryFormat =
  | 'news_article'
  | 'radio_bulletin'
  | 'tv_report'
  | 'feature_article'
  | 'interview'
  | 'investigative_report'
  | 'opinion_piece'
  | 'podcast'
  | 'multimedia_story';

export interface EditorialComment {
  id: string;
  storyId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
  isRevisionRequest?: boolean;
}

export interface StoryVersion {
  id: string;
  storyId: string;
  title: string;
  content: string;
  summary: string;
  savedByUserId: string;
  savedByUserName: string;
  savedAt: string;
  versionNumber: number;
}

export interface Story {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  departmentId: string;
  organizationId: string;
  authorId: string;
  authorName: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
  assignedEditorId?: string;
  assignedEditorName?: string;
  format: StoryFormat;
  priority: StoryPriority;
  status: StoryStatus;
  deadline: string;
  scheduledPublishDate?: string;
  publishedAt?: string;
  publishDestinations?: string[];
  featuredImageUrl?: string;
  wordCount: number;
  tags: string[];
  editorialInstructions?: string;
  supportingDocuments?: { name: string; url: string; size: string }[];
  comments?: EditorialComment[];
  versions?: StoryVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'document' | 'graphic' | 'subtitle';
  url: string;
  size: string;
  duration?: string;
  organizationId: string;
  departmentId?: string;
  storyId?: string;
  uploadedByUserId: string;
  uploadedByUserName: string;
  description: string;
  tags: string[];
  createdAt: string;
}

export interface TranscriptItem {
  id: string;
  title: string;
  organizationId: string;
  audioFileName: string;
  audioDuration?: string;
  language: 'en' | 'nd' | 'sn';
  content: string;
  summary?: string;
  createdByUserId: string;
  createdByName: string;
  linkedStoryId?: string;
  createdAt: string;
}

export interface TranslationItem {
  id: string;
  organizationId: string;
  title: string;
  sourceLang: string;
  targetLang: string;
  originalText: string;
  translatedText: string;
  notes?: string;
  contentType: 'article' | 'headline' | 'social' | 'broadcast';
  createdByUserId: string;
  createdByName: string;
  linkedStoryId?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  organizationId: string;
  type: 'deadline' | 'publication' | 'editorial_meeting' | 'special_event';
  date: string;
  time?: string;
  storyId?: string;
  departmentId?: string;
  assignedUserId?: string;
  description?: string;
  priority: StoryPriority;
}

export interface NotificationItem {
  id: string;
  organizationId: string;
  recipientUserId: string;
  title: string;
  message: string;
  type: 'assignment' | 'deadline' | 'submission' | 'revision' | 'approval' | 'rejection' | 'published' | 'comment';
  storyId?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'story' | 'user' | 'department' | 'organization' | 'media' | 'ai' | 'publishing';
  entityId: string;
  entityTitle: string;
  details: string;
  timestamp: string;
}
