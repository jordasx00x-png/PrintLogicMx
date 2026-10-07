import { playNotificationSound, vibrateDevice } from './soundUtil';

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibrate: boolean;
  notifyOnAccepted: boolean;
  notifyOnNewCheckin: boolean;
}

const SETTINGS_KEY = 'printfix_notification_settings';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  sound: true,
  vibrate: true,
  notifyOnAccepted: true,
  notifyOnNewCheckin: false
};

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_SETTINGS;
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error reading notification settings:', e);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

export function saveNotificationSettings(settings: NotificationSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving notification settings:', e);
  }
}

/**
 * Checks if the browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Gets current notification permission status ('granted' | 'denied' | 'default' | 'unsupported')
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Registers device for background Web Push notifications via Service Worker
 */
export async function registerPushSubscription(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if (!registration) return false;

    // 1. Fetch public VAPID key from backend
    const keyRes = await fetch('/api/notifications/vapid-public-key');
    if (!keyRes.ok) return false;
    const { publicKey } = await keyRes.json();
    if (!publicKey) return false;

    const applicationServerKey = urlBase64ToUint8Array(publicKey);

    // 2. Subscribe to Push Manager
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
    }

    // 3. Send subscription to backend
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription.toJSON())
    });

    console.log('Registered for Web Push notifications');
    return true;
  } catch (err) {
    console.warn('Could not register Web Push subscription:', err);
    return false;
  }
}

/**
 * Requests permission from the user for system notifications and registers Web Push
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Auto-register for background push notifications
      await registerPushSubscription();
    }
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

export interface ShowNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  onClickUrl?: string;
  playSound?: boolean;
  playVibrate?: boolean;
  broadcastPush?: boolean;
}

/**
 * Sends a notification using Service Worker (PWA) or standard Notification API,
 * and triggers Web Push broadcast to wake locked/closed phones
 */
export async function sendAppNotification(options: ShowNotificationOptions): Promise<boolean> {
  const settings = getNotificationSettings();
  if (!settings.enabled) return false;

  // Sound & Vibrate
  if (options.playSound !== false && settings.sound) {
    playNotificationSound();
  }
  if (options.playVibrate !== false && settings.vibrate) {
    vibrateDevice([200, 100, 250, 100, 200]);
  }

  // Also broadcast via backend Web Push so locked/closed mobile devices receive it!
  if (options.broadcastPush !== false) {
    try {
      fetch('/api/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: options.title,
          body: options.body,
          tag: options.tag,
          data: options.data
        })
      }).catch(() => {});
    } catch (e) {}
  }

  // Local System notification
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const iconUrl = options.icon || '/pwa-192x192.png';
  const badgeUrl = options.badge || '/pwa-192x192.png';

  try {
    // 1. Try via Service Worker if available (best for mobile PWA)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(options.title, {
          body: options.body,
          icon: iconUrl,
          badge: badgeUrl,
          tag: options.tag || 'printfix-notification',
          data: {
            url: options.onClickUrl || window.location.href,
            ...options.data
          }
        });
        return true;
      }
    }

    // 2. Fallback to standard Notification API
    const notif = new Notification(options.title, {
      body: options.body,
      icon: iconUrl,
      badge: badgeUrl,
      tag: options.tag || 'printfix-notification'
    });

    if (options.onClickUrl) {
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    }

    return true;
  } catch (error) {
    console.warn('Could not display system notification:', error);
    return false;
  }
}
