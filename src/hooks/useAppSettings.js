import { useEffect, useState } from "react";
import { getSettings, subscribeToSettings } from "../services/settingsService";

export function useAppSettings() {
  const [settings, setSettings] = useState(() => getSettings());

  useEffect(() => subscribeToSettings(setSettings), []);

  return settings;
}
