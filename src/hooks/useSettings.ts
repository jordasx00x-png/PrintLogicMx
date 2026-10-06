import { useState, useEffect } from 'react';
import { CompanySettings } from '../types';
import { subscribeSettings, saveSettingsToFirestore } from '../lib/firestoreService';

export function useSettings(isAuthenticated: boolean = false) {
  const [settings, setSettings] = useState<CompanySettings>({
    name: 'PrintLogicMx',
    address: '',
    phone: '',
    logo: '',
    email: '',
    website: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data || {
          name: 'PrintLogicMx',
          address: '',
          phone: '',
          logo: '',
          email: '',
          website: ''
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: CompanySettings) => {
    setSettings(newSettings);
    try {
      // Save to local SQLite API
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      }).catch(err => console.error('Error saving settings to SQLite:', err));

      // Save to Firestore real-time DB only if authenticated
      if (isAuthenticated) {
        await saveSettingsToFirestore(newSettings);
      }
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();

    if (!isAuthenticated) {
      return;
    }

    // Subscribe to real-time Firestore settings
    const unsubscribe = subscribeSettings((firestoreSettings) => {
      if (firestoreSettings) {
        setSettings(firestoreSettings);
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  return { settings, loading, updateSettings, refreshSettings: fetchSettings };
}
