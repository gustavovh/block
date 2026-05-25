import AsyncStorage from "@react-native-async-storage/async-storage";

type QueueMethod = "POST" | "PUT" | "PATCH" | "DELETE";

export interface SyncQueueItem {
  id: string;
  endpoint: string;
  method: QueueMethod;
  body?: unknown;
  createdAt: number;
  retries: number;
}

const SYNC_QUEUE_KEY = "atleta_sync_queue";
const REQUEST_TIMEOUT_MS = 8000;

async function readQueue(): Promise<SyncQueueItem[]> {
  const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as SyncQueueItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeQueue(queue: SyncQueueItem[]): Promise<void> {
  await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export async function enqueueSyncAction(
  endpoint: string,
  method: QueueMethod,
  body?: unknown
): Promise<SyncQueueItem> {
  const queue = await readQueue();

  const item: SyncQueueItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    endpoint,
    method,
    body,
    createdAt: Date.now(),
    retries: 0,
  };

  queue.push(item);
  await writeQueue(queue);
  return item;
}

export async function getSyncQueueLength(): Promise<number> {
  const queue = await readQueue();
  return queue.length;
}

function isRetryableNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const text = error.message.toLowerCase();
  return (
    text.includes("network") ||
    text.includes("timeout") ||
    text.includes("abort") ||
    text.includes("failed to fetch")
  );
}

async function replayItem(baseUrl: string, token: string, item: SyncQueueItem): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}${item.endpoint}`, {
      method: item.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: item.body ? JSON.stringify(item.body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Queue sync failed with status ${response.status}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

export async function flushSyncQueue(baseUrl: string): Promise<{ synced: number; pending: number }> {
  const token = await AsyncStorage.getItem("atleta_token");
  if (!token) {
    const pending = await getSyncQueueLength();
    return { synced: 0, pending };
  }

  const queue = await readQueue();
  if (!queue.length) {
    return { synced: 0, pending: 0 };
  }

  const remaining: SyncQueueItem[] = [];
  let synced = 0;

  for (let index = 0; index < queue.length; index += 1) {
    const item = queue[index];

    try {
      await replayItem(baseUrl, token, item);
      synced += 1;
    } catch (error) {
      const retriable = isRetryableNetworkError(error);
      remaining.push({
        ...item,
        retries: item.retries + 1,
      });

      // Stop batch on connection issues to avoid battery drain and repeated failures.
      if (retriable) {
        remaining.push(...queue.slice(index + 1));
        break;
      }
    }
  }

  await writeQueue(remaining);
  return { synced, pending: remaining.length };
}
