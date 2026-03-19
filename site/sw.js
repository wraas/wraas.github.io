const CACHE_NAME = 'wraas-v1';
const CRITICAL_ASSETS = [
    '/',
    '/index.html',
    '/404.html',
    '/style.css',
    '/script.js',
    '/rick.gif',
    '/rick.webp',
    'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700'
];

// Install event: pre-cache critical resources
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(CRITICAL_ASSETS).catch(function(error) {
                console.warn('Cache addAll error:', error);
                // Continue even if some assets fail to cache
                return Promise.resolve();
            });
        })
    );
    self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event: cache-first strategy
self.addEventListener('fetch', function(event) {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(function(response) {
            // Return cached response if available
            if (response) {
                return response;
            }

            // Otherwise, fetch from network
            return fetch(event.request).then(function(response) {
                // Don't cache non-successful responses
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                // Clone the response for caching
                var responseToCache = response.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, responseToCache);
                });

                return response;
            }).catch(function() {
                // Fall back to a simple offline page if available
                return caches.match('/index.html');
            });
        })
    );
});
