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
  
  // Split query into multiple words for fuzzy search
  const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 0);
  
  return channels.filter(channel => {
    // Search in multiple fields
    const searchTargets = [
      channel.name,
      channel.displayName,
      channel.customAlias,
      channel.topic
    ].filter(Boolean).map(s => s!.toLowerCase());
    
    // Create a combined search string
    const combinedTarget = searchTargets.join(' ');
    
    // Check if ALL query words are found in any of the fields
    // This allows for flexible word order like fzf
    return queryWords.every(word => {
      return searchTargets.some(target => target.includes(word)) || 
             combinedTarget.includes(word);
    });
  }).sort((a, b) => {
    // Sort by relevance: prioritize exact matches and matches at the beginning
    const aName = (a.name || '').toLowerCase();
    const bName = (b.name || '').toLowerCase();
    
    // Exact match gets highest priority
    if (aName === normalizedQuery) return -1;
    if (bName === normalizedQuery) return 1;
    
    // Starting with query gets second priority
    if (aName.startsWith(normalizedQuery)) return -1;
    if (bName.startsWith(normalizedQuery)) return 1;
    
    // Calculate match score based on word positions
    const getScore = (channel: Channel) => {
      const name = (channel.name || '').toLowerCase();
      let score = 0;
      queryWords.forEach((word, index) => {
        const pos = name.indexOf(word);
        if (pos === 0) score += 100; // Word at start
        else if (pos > 0) score += 50; // Word found
        score -= index * 10; // Penalty for word order
      });
      return score;
    };
    
    const aScore = getScore(a);
    const bScore = getScore(b);
    
    if (aScore !== bScore) return bScore - aScore;
    
    // Fall back to alphabetical
    return aName.localeCompare(bName);
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