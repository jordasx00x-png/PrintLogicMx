import { playNotificationSound, vibrateDevice } from './soundUtil';
import { savePushSubscriptionToFirestore } from '../lib/firestoreService';

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
  notifyOnNewCheckin: true,
};

/**
 * Loads notification settings from localStorage
 */
export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

/**
 * Saves notification settings to localStorage
 */
export function saveNotificationSettings(settings: NotificationSettings): void {
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
 * Checks if running on iOS (iPhone / iPad)
 */
export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Checks if running as a Standalone PWA (installed to home screen)
 */
export function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true ||
    document.referrer.includes('android-app://');
}

/**
 * Gets current notification permission status ('granted' | 'denied' | 'default' | 'unsupported')
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
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
 * Helper to ensure an active Service Worker registration is available
 */
export async function getOrRegisterServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    let reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    }
    // Timeout of 2.5s on ready so it NEVER hangs mobile devices if background worker is delayed
    const readyTimeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
    const activeReg = await Promise.race([navigator.serviceWorker.ready, readyTimeout]);
    return activeReg || reg;
  } catch (err) {
    console.warn('Could not obtain service worker registration:', err);
    return null;
  }
}

export interface PushRegistrationResult {
  success: boolean;
  message: string;
  deviceCount?: number;
}

/**
 * Registers device for background Web Push notifications via Service Worker
 */
export async function registerPushSubscription(): Promise<PushRegistrationResult> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return { success: false, message: 'Tu navegador no soporta Service Workers' };
  }

  if (!('PushManager' in window)) {
    if (isIOSDevice() && !isStandalonePWA()) {
      return { 
        success: false, 
        message: 'En iPhone (iOS) debes agregar la app a la Pantalla de Inicio (Compartir > Añadir a pantalla de inicio) para activar notificaciones' 
      };
    }
    return { success: false, message: 'Tu navegador no soporta PushManager' };
  }

  try {
    const registration = await getOrRegisterServiceWorker();
    if (!registration) {
      return { success: false, message: 'No se pudo iniciar el Service Worker en el dispositivo' };
    }

    if (!registration.pushManager) {
      return { success: false, message: 'PushManager no está disponible en este navegador' };
    }

    // 1. Fetch public VAPID key from backend
    const keyRes = await fetch('/api/notifications/vapid-public-key');
    if (!keyRes.ok) {
      return { success: false, message: 'Error de conexión con el servidor para obtener la clave de notificaciones' };
    }
    const { publicKey } = await keyRes.json();
    if (!publicKey) {
      return { success: false, message: 'Clave pública VAPID no disponible' };
    }

    const applicationServerKey = urlBase64ToUint8Array(publicKey);

    // 2. Obtain existing or new subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });
      } catch (subErr: any) {
        console.error('Subscription creation failed:', subErr);
        return { success: false, message: `Error al suscribir el dispositivo: ${subErr.message || 'Permiso denegado'}` };
      }
    }

    if (!subscription) {
      return { success: false, message: 'No se pudo crear la suscripción en el navegador del dispositivo' };
    }

    const subJson = subscription.toJSON();

    // 3. Send subscription to SQLite backend
    const res = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subJson)
    });

    const data = await res.json().catch(() => ({}));

    // 4. Also backup subscription in Firestore
    await savePushSubscriptionToFirestore(subJson);

    if (res.ok) {
      localStorage.setItem('printfix_push_registered', 'true');
      console.log('✅ Device successfully registered for Web Push. Active devices:', data.count);
      return { 
        success: true, 
        message: 'Celular registrado correctamente para recibir avisos con pantalla bloqueada',
        deviceCount: data.count 
      };
    }
    return { success: false, message: data.error || 'Error al guardar la suscripción en el servidor' };
  } catch (err: any) {
    console.error('Could not register Web Push subscription:', err);
    return { success: false, message: `Error: ${err.message || 'Fallo desconocido al registrar'}` };
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

  // Sound & Vibrate locally
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

  const iconUrl = '/pwa-192x192.png';
  const badgeUrl = '/pwa-192x192.png';

  try {
    // 1. Try via Service Worker if available (best for mobile PWA)
    if ('serviceWorker' in navigator) {
      const registration = await getOrRegisterServiceWorker();
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
    console.warn('Could not display local system notification:', error);
    return false;
  }
}

/**
 * Triggers a scheduled server push test with a delay (in seconds)
 * allowing the user to lock their phone and verify the notification arrives on the lock screen.
 */
export async function scheduleTestPushForLockScreen(seconds: number = 10): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/notifications/test-scheduled', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delaySeconds: seconds })
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return { success: true, message: `Notificación programada para dentro de ${seconds} segundos` };
    }
    return { success: false, message: data.error || 'Error al programar prueba en el servidor' };
  } catch (err: any) {
    console.error('Error scheduling lock screen push test:', err);
    return { success: false, message: err.message || 'Error de conexión' };
  }
}

/**
 * Fetches count of active subscribed devices
 */
export async function getRegisteredDevicesCount(): Promise<number> {
  try {
    const res = await fetch('/api/notifications/count');
    if (res.ok) {
      const data = await res.json();
      return Number(data.count) || 0;
    }
    return 0;
  } catch (e) {
    return 0;
  }
}
