import {
  ActionPanel,
  Action,
  List,
  showToast,
  Toast,
  Icon,
  getPreferenceValues,
  Keyboard,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { Channel, Preferences } from "./types";
import { getChannels, shouldShowUpdateReminder } from "./lib/storage";
import {
  openChannelInSlack,
  getChannelIcon,
  getChannelTypeLabel,
  formatChannelName,
  searchChannels,
  sortChannels,
  generateSlackWebUrl,
} from "./lib/slack";

export default function SearchSlackChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const preferences = getPreferenceValues<Preferences>();

  useEffect(() => {
    loadChannels();
  }, []);

  async function loadChannels() {
    try {
      const loadedChannels = await getChannels();
      
      if (loadedChannels.length === 0) {
        showToast({
          style: Toast.Style.Failure,
          title: "No Channels Found",
          message: "Please update your channel list first",
        });
      } else {
        // Check for update reminder
        const shouldRemind = await shouldShowUpdateReminder(preferences.updateReminderDays || 7);
        if (shouldRemind) {
          showToast({
            style: Toast.Style.Animated,
            title: "Channel List May Be Outdated",
            message: "Consider updating your channel list",
          });
        }
      }
      
      setChannels(sortChannels(loadedChannels));
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to Load Channels",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const filteredChannels = searchChannels(channels, searchText);
  const showArchived = preferences.showArchived !== false;
  const displayChannels = showArchived 
    ? filteredChannels 
    : filteredChannels.filter(c => !c.isArchived);

  return (
    <List
      isLoading={isLoading}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search channels, DMs, or aliases..."
      navigationTitle="Search Slack Channels"
    >
      {displayChannels.length === 0 && !isLoading ? (
        <List.EmptyView
          title={searchText ? "No Channels Found" : "No Channels Available"}
          description={
            searchText
              ? "Try a different search term"
              : "Update your channel list to get started"
          }
          actions={
            <ActionPanel>
              <Action.OpenInBrowser
                title="How to Extract Channels"
                url="https://github.com/your-repo/slack-channel-opener#setup"
              />
            </ActionPanel>
          }
        />
      ) : (
        displayChannels.map((channel) => (
          <List.Item
            key={channel.id}
            title={formatChannelName(channel)}
            subtitle={channel.topic}
            icon={getChannelIcon(channel.type)}
            accessories={[
              channel.memberCount ? { text: `${channel.memberCount} members` } : null,
              { text: getChannelTypeLabel(channel.type) },
              channel.isArchived ? { tag: { value: "Archived", color: "#666" } } : null,
            ].filter(Boolean) as any[]}
            actions={
              <ActionPanel>
                <ActionPanel.Section>
                  <Action
                    title="Open in Slack App"
                    icon={Icon.AppWindow}
                    onAction={() => handleOpenChannel(channel, false)}
                  />
                  <Action
                    title="Open in Browser"
                    icon={Icon.Globe}
                    onAction={() => handleOpenChannel(channel, true)}
                    shortcut={{ modifiers: ["cmd"], key: "o" }}
                  />
                </ActionPanel.Section>
                <ActionPanel.Section>
                  <Action.CopyToClipboard
                    title="Copy Channel Name"
                    content={channel.name}
                    shortcut={{ modifiers: ["cmd"], key: "c" }}
                  />
                  <Action.CopyToClipboard
                    title="Copy Channel ID"
                    content={channel.id}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                  />
                  <Action.CopyToClipboard
                    title="Copy Web URL"
                    content={generateSlackWebUrl(channel)}
                    shortcut={{ modifiers: ["cmd", "opt"], key: "c" }}
                  />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );

  async function handleOpenChannel(channel: Channel, preferWeb: boolean) {
    try {
      await openChannelInSlack(channel, preferWeb);
      showToast({
        style: Toast.Style.Success,
        title: "Opening Channel",
        message: `Opening ${channel.name} in ${preferWeb ? "browser" : "Slack app"}`,
      });
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to Open Channel",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}