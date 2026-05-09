import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const HISTORY_KEY = "medscan_history";

export interface LocalScanItem {
  id: string;
  name: string;
  dosage: string;
  primaryUse: string;
  approximatePrice: string;
  generalInfo: string;
  warnings: string;
  identified: boolean;
  imageUri?: string | null;
  createdAt: string;
}

async function readAll(): Promise<LocalScanItem[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalScanItem[];
  } catch {
    return [];
  }
}

async function writeAll(items: LocalScanItem[]): Promise<void> {
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(items));
}

export async function addScanToHistory(item: Omit<LocalScanItem, "id" | "createdAt">): Promise<LocalScanItem> {
  const newItem: LocalScanItem = {
    ...item,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  const existing = await readAll();
  await writeAll([newItem, ...existing]);
  return newItem;
}

export async function getAllScans(): Promise<LocalScanItem[]> {
  return readAll();
}

export async function getScanById(id: string): Promise<LocalScanItem | null> {
  const all = await readAll();
  return all.find((item) => item.id === id) ?? null;
}

export function useLocalHistory() {
  const [items, setItems] = useState<LocalScanItem[]>([]);
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

  return { items, isLoading, reload: load };
}
