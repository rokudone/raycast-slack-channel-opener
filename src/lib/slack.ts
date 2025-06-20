import { open } from "@raycast/api";
import { Channel, ChannelType } from "../types";

export function generateSlackDeepLink(channel: Channel): string {
  return `slack://channel?team=${channel.teamId}&id=${channel.id}`;
}

export function generateSlackWebUrl(channel: Channel): string {
  // Web URL format varies by channel type
  if (channel.type === ChannelType.IM) {
    return `https://app.slack.com/client/${channel.teamId}/${channel.id}`;
  }
  
  return `https://app.slack.com/client/${channel.teamId}/${channel.id}`;
}

export async function openChannelInSlack(channel: Channel, preferWeb: boolean = false): Promise<void> {
  const url = preferWeb ? generateSlackWebUrl(channel) : generateSlackDeepLink(channel);
  
  try {
    await open(url);
  } catch (error) {
    // If deep link fails, try web URL as fallback
    if (!preferWeb) {
      console.log("Deep link failed, trying web URL");
      await open(generateSlackWebUrl(channel));
    } else {
      throw error;
    }
  }
}

export function getChannelIcon(type: ChannelType): string {
  switch (type) {
    case ChannelType.CHANNEL:
      return "💬";
    case ChannelType.GROUP:
      return "🔒";
    case ChannelType.IM:
      return "👤";
    case ChannelType.MPIM:
      return "👥";
    default:
      return "💬";
  }
}

export function getChannelTypeLabel(type: ChannelType): string {
  switch (type) {
    case ChannelType.CHANNEL:
      return "Public Channel";
    case ChannelType.GROUP:
      return "Private Channel";
    case ChannelType.IM:
      return "Direct Message";
    case ChannelType.MPIM:
      return "Group Message";
    default:
      return "Channel";
  }
}

export function formatChannelName(channel: Channel): string {
  if (channel.customAlias) {
    return `${channel.customAlias} (${channel.displayName || channel.name})`;
  }
  
  return channel.displayName || channel.name;
}

export function searchChannels(channels: Channel[], query: string): Channel[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) {
    return channels;
  }
  
  return channels.filter(channel => {
    // Search in multiple fields
    const searchTargets = [
      channel.name,
      channel.displayName,
      channel.customAlias,
      channel.topic
    ].filter(Boolean).map(s => s!.toLowerCase());
    
    // Check if any field contains the query
    return searchTargets.some(target => target.includes(normalizedQuery));
  });
}

export function sortChannels(channels: Channel[]): Channel[] {
  return [...channels].sort((a, b) => {
    // Sort by type priority
    const typePriority = {
      [ChannelType.CHANNEL]: 0,
      [ChannelType.GROUP]: 1,
      [ChannelType.IM]: 2,
      [ChannelType.MPIM]: 3
    };
    
    const typeDiff = typePriority[a.type] - typePriority[b.type];
    if (typeDiff !== 0) return typeDiff;
    
    // Then by activity (if available)
    if (a.lastActivity && b.lastActivity) {
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    }
    
    // Finally alphabetically
    return a.name.localeCompare(b.name);
  });
}