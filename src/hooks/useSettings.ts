import { useState, useEffect, useCallback } from 'react';
import { CompanySettings } from '../types';
import { subscribeSettings, saveSettingsToFirestore } from '../lib/firestoreService';

const DEFAULT_SETTINGS: CompanySettings = {
  name: 'PrintLogicMx',
  address: '',
  phone: '',
  logo: '',
  email: '',
  website: ''
};

const LOCAL_STORAGE_KEY = 'printfix_company_settings';

export function useSettings(isAuthenticated: boolean = true) {
  const [settings, setSettings] = useState<CompanySettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_SETTINGS, ...parsed };
        }
      }
    } catch (e) {
      console.error('Error reading settings from localStorage:', e);
    }
    return DEFAULT_SETTINGS;
  });
  const [loading, setLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object' && (data.name || data.phone || data.email || data.address || data.logo)) {
          const merged = { ...DEFAULT_SETTINGS, ...data };
          setSettings(merged);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        }
      }
    } catch (error) {
      // Harmless on static hosting like GitHub Pages
    }
  }, []);

  const updateSettings = async (newSettings: CompanySettings): Promise<boolean> => {
    const cleanSettings: CompanySettings = {
      name: (newSettings.name || '').trim() || DEFAULT_SETTINGS.name,
      address: (newSettings.address || '').trim(),
      phone: (newSettings.phone || '').trim(),
      logo: newSettings.logo || '',
      email: (newSettings.email || '').trim(),
      website: (newSettings.website || '').trim()
    };

    // 1. Instant local UI update
    setSettings(cleanSettings);

    // 2. Local storage persistence
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanSettings));
    } catch (e) {
      console.error('Error saving settings to localStorage:', e);
    }

    let firestoreOk = false;
    let localApiOk = false;

    // 3. Local SQLite API (if server is active)
    try {
      const apiRes = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanSettings)
      });
      if (apiRes.ok) localApiOk = true;
    } catch (e) {
      // Static environment fallback
    }

    // 4. Firestore Cloud Real-Time DB (works everywhere, including GitHub Pages)
    try {
      await saveSettingsToFirestore(cleanSettings);
      firestoreOk = true;
    } catch (error) {
      console.error('Error saving settings to Firestore:', error);
    }

    return true;
  };

  useEffect(() => {
    fetchSettings();

    // Subscribe to real-time Firestore settings across devices
    let unsubscribe = () => {};
    try {
      unsubscribe = subscribeSettings((firestoreSettings) => {
        if (firestoreSettings && typeof firestoreSettings === 'object') {
          const merged = { ...DEFAULT_SETTINGS, ...firestoreSettings };
          setSettings(merged);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
          } catch (e) {}
        }
      });
    } catch (e) {
      console.error('Error subscribing to Firestore settings:', e);
    }

    return () => unsubscribe();
  }, [fetchSettings]);

  return { settings, loading, updateSettings, refreshSettings: fetchSettings };
}
