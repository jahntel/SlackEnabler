export type PriorityType = 'high' | 'low' | 'neutral';

export interface SlackMessage {
  id: string;
  channel: string;
  user: string;
  avatar: string;
  text: string;
  timestamp: string;
  priority: PriorityType;
  intent: string;
  explanation: string;
  shieldStatus: 'allowed' | 'queued' | 'none';
  relevantMcpContext?: string;
}

export interface SlackChannel {
  id: string;
  name: string;
  description: string;
  isMuted: boolean;
}

export interface UserPreferences {
  deepWorkActive: boolean;
  focusEndTime: string | null;
  mcpContext: string;
  mcpActive: boolean;
  notificationsEnabled: boolean;
}

export interface CatchUpTimeline {
  id: string;
  channelName: string;
  title: string;
  generatedAt: string;
  content: string;
  sourceMessageCount: number;
}

export interface WorkspaceData {
  messages: SlackMessage[];
  channels: SlackChannel[];
  preferences: UserPreferences;
  timelines: CatchUpTimeline[];
}
