import { environment } from "@raycast/api";
import { promises as fs } from "fs";
import path from "path";
import { Channel, ChannelStorage } from "../types";

const STORAGE_FILE = path.join(environment.supportPath, "channels.json");

export async function ensureStorageDirectory(): Promise<void> {
  await fs.mkdir(environment.supportPath, { recursive: true });
}

export async function readChannels(): Promise<ChannelStorage | null> {
  try {
    await ensureStorageDirectory();
    const data = await fs.readFile(STORAGE_FILE, "utf-8");
    const storage = JSON.parse(data) as ChannelStorage;
    
    // Validate storage format
    if (!storage.version || !Array.isArray(storage.channels)) {
      console.error("Invalid storage format");
      return null;
    }
    
    return storage;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      // File doesn't exist yet
      return null;
    }
    console.error("Error reading channels:", error);
    return null;
  }
}

export async function writeChannels(storage: ChannelStorage): Promise<void> {
  await ensureStorageDirectory();
  const data = JSON.stringify(storage, null, 2);
  await fs.writeFile(STORAGE_FILE, data, "utf-8");
}

export async function updateChannels(channels: Channel[]): Promise<void> {
  const storage: ChannelStorage = {
    version: 1,
    lastUpdated: new Date().toISOString(),
    channels: channels
  };
  
  await writeChannels(storage);
}

export async function getChannels(): Promise<Channel[]> {
  const storage = await readChannels();
  return storage?.channels || [];
}

export async function getLastUpdateTime(): Promise<Date | null> {
  const storage = await readChannels();
  if (!storage?.lastUpdated) return null;
  
  return new Date(storage.lastUpdated);
}

export async function shouldShowUpdateReminder(reminderDays: number = 7): Promise<boolean> {
  const lastUpdate = await getLastUpdateTime();
  if (!lastUpdate) return true;
  
  const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceUpdate > reminderDays;
}

export async function addCustomAlias(channelId: string, alias: string): Promise<void> {
  const storage = await readChannels();
  if (!storage) return;
  
  const channel = storage.channels.find(c => c.id === channelId);
  if (channel) {
    channel.customAlias = alias;
    await writeChannels(storage);
  }
}

export async function removeCustomAlias(channelId: string): Promise<void> {
  const storage = await readChannels();
  if (!storage) return;
  
  const channel = storage.channels.find(c => c.id === channelId);
  if (channel) {
    delete channel.customAlias;
    await writeChannels(storage);
  }
}