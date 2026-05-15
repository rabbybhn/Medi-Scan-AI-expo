import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const VAULT_KEY = "medscan_vault";

export interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
  frequency: "daily" | "morning" | "afternoon" | "evening";
  notificationId?: string;
}

export interface VaultItem {
  scanId: string;
  addedAt: string;
  reminder: ReminderSettings | null;
}

async function readAll(): Promise<VaultItem[]> {
  try {
    const raw = await AsyncStorage.getItem(VAULT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as VaultItem[];
  } catch {
    return [];
  }
}

async function writeAll(items: VaultItem[]): Promise<void> {
  await AsyncStorage.setItem(VAULT_KEY, JSON.stringify(items));
}

export async function addToVault(scanId: string): Promise<void> {
  const existing = await readAll();
  if (existing.find((v) => v.scanId === scanId)) return;
  await writeAll([{ scanId, addedAt: new Date().toISOString(), reminder: null }, ...existing]);
}

export async function removeFromVault(scanId: string): Promise<void> {
  const existing = await readAll();
  await writeAll(existing.filter((v) => v.scanId !== scanId));
}

export async function isInVault(scanId: string): Promise<boolean> {
  const existing = await readAll();
  return existing.some((v) => v.scanId === scanId);
}

export async function updateReminder(scanId: string, reminder: ReminderSettings | null): Promise<void> {
  const existing = await readAll();
  await writeAll(existing.map((v) => (v.scanId === scanId ? { ...v, reminder } : v)));
}

export function useVault() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await readAll();
    setItems(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const add = useCallback(
    async (scanId: string) => {
      await addToVault(scanId);
      await load();
    },
    [load]
  );

  const remove = useCallback(
    async (scanId: string) => {
      await removeFromVault(scanId);
      await load();
    },
    [load]
  );

  const setReminder = useCallback(
    async (scanId: string, reminder: ReminderSettings | null) => {
      await updateReminder(scanId, reminder);
      await load();
    },
    [load]
  );

  return { items, isLoading, reload: load, add, remove, setReminder };
}
