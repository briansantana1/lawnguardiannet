/**
 * Site Settings Hook
 * 
 * Fetches and caches site settings from the database.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  label: string;
  category: string;
  description: string | null;
}

export type SiteSettings = Record<string, string>;

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value");

      if (error) throw error;

      const settingsMap: SiteSettings = {};
      data?.forEach((item: { key: string; value: string | null }) => {
        settingsMap[item.key] = item.value || "";
      });

      setSettings(settingsMap);
    } catch (err) {
      console.error("Error fetching site settings:", err);
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const getSetting = (key: string, fallback: string = ""): string => {
    return settings[key] || fallback;
  };

  return { settings, loading, error, getSetting, refresh: fetchSettings };
}
