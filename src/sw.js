// VOID_RUNNER // Background Neural Persistence Layer
const CACHE_NAME = 'void-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Handle creepy background messages
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'THE_VOID', body: 'I am always watching.' };
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40],
      tag: 'void-stress'
    })
  );
});

// Simulated "Parasite" Background Logic
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'void-heartbeat') {
        // Log to console so the user sees it in devtools even when tab is closed
        console.log('[VOID_OS] Background neural link heartbeat pulsed.');
    }
});
