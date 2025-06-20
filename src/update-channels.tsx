import {
  Form,
  ActionPanel,
  Action,
  showToast,
  Toast,
  popToRoot,
  Clipboard,
  useNavigation,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { ChannelStorage } from "./types";
import { updateChannels, getLastUpdateTime } from "./lib/storage";

export default function UpdateChannels() {
  const [jsonData, setJsonData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { pop } = useNavigation();

  useEffect(() => {
    loadInfo();
  }, []);

  async function loadInfo() {
    // Get last update time
    const updateTime = await getLastUpdateTime();
    setLastUpdate(updateTime);

    // Try to get data from clipboard
    try {
      const clipboardText = await Clipboard.readText();
      if (clipboardText && isValidChannelJson(clipboardText)) {
        setJsonData(clipboardText);
        showToast({
          style: Toast.Style.Success,
          title: "Clipboard Data Detected",
          message: "Found channel data in clipboard",
        });
      }
    } catch (error) {
      // Clipboard might be empty or contain non-text data
    }
  }

  function isValidChannelJson(text: string): boolean {
    try {
      const data = JSON.parse(text);
      return data.version && Array.isArray(data.channels);
    } catch {
      return false;
    }
  }

  async function handleSubmit() {
    if (!jsonData.trim()) {
      showToast({
        style: Toast.Style.Failure,
        title: "No Data",
        message: "Please paste the channel data",
      });
      return;
    }

    setIsLoading(true);

    try {
      const storage: ChannelStorage = JSON.parse(jsonData);

      // Validate structure
      if (!storage.version || !Array.isArray(storage.channels)) {
        throw new Error("Invalid data format");
      }

      // Validate channels
      const invalidChannels = storage.channels.filter(
        (c) => !c.id || !c.name || !c.teamId || !c.type
      );

      if (invalidChannels.length > 0) {
        throw new Error(`${invalidChannels.length} channels have missing required fields`);
      }

      // Update storage
      await updateChannels(storage.channels);

      showToast({
        style: Toast.Style.Success,
        title: "Channels Updated",
        message: `Successfully imported ${storage.channels.length} channels`,
      });

      // Go back to search
      pop();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Update Failed",
        message: error instanceof Error ? error.message : "Invalid JSON data",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function formatLastUpdate(): string {
    if (!lastUpdate) return "Never";

    const now = new Date();
    const diff = now.getTime() - lastUpdate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      return "Less than an hour ago";
    }
  }

  return (
    <Form
      isLoading={isLoading}
      navigationTitle="Update Channel List"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Update Channels"
            onSubmit={handleSubmit}
          />
          <Action.OpenInBrowser
            title="How to Extract Channels"
            url="https://github.com/your-repo/slack-channel-opener#extracting-channels"
          />
        </ActionPanel>
      }
    >
      <Form.Description
        title="Update Channel List"
        text={`Import channel data from Slack to keep your list up to date.\n\nLast update: ${formatLastUpdate()}`}
      />

      <Form.TextArea
        id="jsonData"
        title="Channel Data"
        placeholder='Paste the JSON data from the bookmarklet here...\n\n{\n  "version": 1,\n  "channels": [...]\n}'
        value={jsonData}
        onChange={setJsonData}
        info="Run the extraction bookmarklet in Slack web to copy channel data"
      />

      <Form.Separator />

      <Form.Description
        title="How to Extract Channels"
        text={`1. Open Slack in your web browser
2. Make sure you're in the correct workspace
3. Run the extraction bookmarklet
4. The channel data will be copied to your clipboard
5. Paste it above and click "Update Channels"`}
      />
    </Form>
  );
}