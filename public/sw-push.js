// Service Worker Push Event Handler for PrintFix PWA
// Receives notifications even when the app is completely closed or the phone is locked

self.addEventListener('push', function(event) {
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
      .catch(function(err) {
        console.warn('Full notification failed, retrying with basic options:', err);
        return self.registration.showNotification(title, baseOptions);
      })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.action === 'close') return;

  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
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
