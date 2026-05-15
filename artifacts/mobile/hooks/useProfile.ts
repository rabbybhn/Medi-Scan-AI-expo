import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  profilePicture: string | null;
}

const PROFILE_KEY = "medscan_profile";

const DEFAULT_PROFILE: ProfileData = {
  name: "",
  email: "",
  phone: "",
  profilePicture: null,
};

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(PROFILE_KEY);
      if (raw) setProfile(JSON.parse(raw) as ProfileData);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async (updates: Partial<ProfileData>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      void AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { profile, isLoading, save };
}
