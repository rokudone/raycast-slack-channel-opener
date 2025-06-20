export enum ChannelType {
  CHANNEL = "channel",
  GROUP = "group",
  IM = "im",
  MPIM = "mpim"
}

export interface Channel {
  id: string;
  name: string;
  displayName?: string;
  teamId: string;
  type: ChannelType;
  topic?: string;
  memberCount?: number;
  isArchived?: boolean;
  lastActivity?: string;
  customAlias?: string;
}

export interface ChannelStorage {
  version: number;
  lastUpdated: string;
  channels: Channel[];
}

export interface Preferences {
  defaultAction?: "app" | "web";
  searchBehavior?: "fuzzy" | "exact";
  updateReminderDays?: number;
  showArchived?: boolean;
}