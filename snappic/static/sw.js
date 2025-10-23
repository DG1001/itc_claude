// Service Worker for SnapPic PWA
const CACHE_NAME = 'snappic-v1';
const urlsToCache = [
    '/',
    '/static/style.css',
    '/static/script.js',
    '/static/manifest.json',
    '/static/icon-192.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.log('Cache installation failed:', error);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache when offline, network first for API calls
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Network first for API calls and uploads
    if (url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/upload') ||
        url.pathname.startsWith('/uploads/')) {
        event.respondWith(
            fetch(request)
                .catch(() => {
                    // If network fails and it's an API call, return empty array
                    if (url.pathname.startsWith('/api/images')) {
                        return new Response('[]', {
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                    // For other requests, try cache
                    return caches.match(request);
                })
        );
        return;
    }

    // Cache first for static assets
    event.respondWith(
        caches.match(request)
            .then((response) => {
                if (response) {
                    return response;
                }

                return fetch(request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });

                        return response;
                    });
            })
            .catch(() => {
                // Return a basic offline page or message
                if (request.destination === 'document') {
                    return new Response(
                        '<html><body><h1>Offline</h1><p>Please check your internet connection.</p></body></html>',
                        { headers: { 'Content-Type': 'text/html' } }
                    );
                }
            })
    );
});

// Handle background sync if supported
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-images') {
        event.waitUntil(
            // Implement sync logic here if needed
            Promise.resolve()
        );
    }
});
