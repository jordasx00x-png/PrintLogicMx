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
  const options = {
    body: data.body || 'Un equipo ha sido marcado como ACEPTADO en el taller.',
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/pwa-192x192.png',
    vibrate: [300, 100, 300, 100, 400],
    tag: data.tag || `printfix-alert-${Date.now()}`,
    data: data.data || { url: '/' },
    renotify: true,
    requireInteraction: true,
    actions: [
      { action: 'open', title: '👁️ Ver Equipo' },
      { action: 'close', title: 'Cerrar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
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
