import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Lang, translate } from "@/constants/i18n";

const LANG_KEY = "medscan_lang";

type LanguageContextType = {
  lang: Lang;
  setLang: (l: Lang) => Promise<void>;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "bn",
  setLang: async () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((stored) => {
      if (stored === "en" || stored === "bn") setLangState(stored);
    });
  }, []);

  const setLang = useCallback(async (l: Lang) => {
    setLangState(l);
    await AsyncStorage.setItem(LANG_KEY, l);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(key, lang, vars),
    [lang],
  );

  return React.createElement(LanguageContext.Provider, { value: { lang, setLang, t } }, children);
}

export function useLanguage() {
  return useContext(LanguageContext);
}
