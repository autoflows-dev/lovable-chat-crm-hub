
export interface Contact {
  id: string;
  name: string;
  phone: string;
  profilePic?: string;
  lastMessage?: Message;
  unreadCount?: number;
  status?: 'online' | 'offline';
  tags?: string[];
  funnelStage?: string;
  originMetadata?: ContactOriginMetadata;
}

export interface ContactOriginMetadata {
  source: string; // e.g., 'facebook', 'instagram', 'organic'
  campaign?: string;
  adId?: string;
  adImage?: string;
  referrer?: string;
  sourceApp?: string;
  timestamp: string;
}

export interface Message {
  id: string;
  contactId: string;
  content: string;
  timestamp: string;
  direction: 'in' | 'out';
  status?: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'video' | 'document' | 'audio' | 'location';
  mediaUrl?: string;
  metadata?: any;
}

export interface KanbanColumn {
  id: string;
  title: string;
  contactIds: string[];
}

export interface BulkMessageCampaign {
  id: string;
  name: string;
  template: string;
  scheduledAt: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  contactIds: string[];
  mediaUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'viewer';
  avatar?: string;
}

export interface AnalyticsData {
  messagesSent: number;
  messagesReceived: number;
  responseRate: number;
  averageResponseTime: number;
  contactsBySource: Record<string, number>;
  messagesByDay: {
    date: string;
    sent: number;
    received: number;
  }[];
}
