// PrintFix Service Worker with Offline Support & Background Web Push Notifications
const CACHE_NAME = 'printfix-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png'
];

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-cache error (ignorable in dev):', err);
      });
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
    ])
  );
});

// Fetch Event (Network First with Cache Fallback for navigation, Cache First for assets)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Only handle GET requests and http/https schemes
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // Never cache API routes
  if (request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses for static assets
        if (response.status === 200 && (
          request.url.endsWith('.png') ||
          request.url.endsWith('.svg') ||
          request.url.endsWith('.ico') ||
          request.url.endsWith('.woff2')
        )) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback to index.html for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/index.html') || caches.match('/');
        }
        return new Response('Network error occurred', { status: 408, headers: { 'Content-Type': 'text/plain' } });
      })
  );
});

// Push Event: Triggers when the server sends a background push notification (even if app is closed or phone is locked)
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'PrintFix - Taller', body: event.data.text() };
    }
  }

  const title = data.title || '¡Equipo Aceptado! 🎉';
  const tag = data.tag || `printfix-alert-${Date.now()}`;
  const iconUrl = '/pwa-192x192.png';

  const baseOptions = {
    body: data.body || 'Un equipo ha sido marcado como ACEPTADO en el taller.',
    icon: iconUrl,
    badge: iconUrl,
    tag: tag,
    data: data.data || { url: '/' },
    renotify: true,
    requireInteraction: true
  };

  // Try with vibration and actions first; fallback to basic options if unsupported (e.g. iOS WebKit)
  const fullOptions = {
    ...baseOptions,
    vibrate: [300, 100, 300, 100, 400],
    actions: [
      { action: 'open', title: '👁️ Ver Equipo' },
      { action: 'close', title: 'Cerrar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, fullOptions)
      .catch((err) => {
        console.warn('Full notification failed, retrying with basic options:', err);
        return self.registration.showNotification(title, baseOptions);
      })
  );
});

// Notification Click Event: Opens app when user taps the notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
