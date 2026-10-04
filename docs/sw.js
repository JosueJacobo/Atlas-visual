const APP_CACHE = 'atlas-orquideas-app-v4';
const PHOTO_CACHE = 'atlas-orquideas-photos-v4';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './app-icon.jpg',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('Pre-caching core assets notice:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== APP_CACHE && key !== PHOTO_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip Firebase real-time endpoints
  if (
    url.origin.includes('firestore.googleapis.com') ||
    url.origin.includes('identitytoolkit.googleapis.com')
  ) {
    return;
  }

  // 1. IMAGE REQUESTS (Local, Wikimedia Commons, iNaturalist S3):
  // Cache-First so once a photo is seen or pre-downloaded, it works 100% WITHOUT INTERNET!
  const isImage =
    request.destination === 'image' ||
    /\.(jpg|jpeg|png|webp|svg|gif)(\?.*)?$/i.test(url.pathname) ||
    url.hostname.includes('wikimedia.org') ||
    url.hostname.includes('inaturalist');

  if (isImage && !url.pathname.includes('/w/api.php') && !url.pathname.includes('/v1/')) {
    event.respondWith(
      caches.open(PHOTO_CACHE).then((cache) => {
        return cache.match(request, { ignoreSearch: false }).then((cachedImg) => {
          if (cachedImg) {
            return cachedImg;
          }
          return fetch(request)
            .then((networkRes) => {
              // Cache basic, cors, AND opaque responses so external photos work offline
              if (
                networkRes &&
                (networkRes.status === 200 || networkRes.type === 'opaque')
              ) {
                cache.put(request, networkRes.clone()).catch(() => {});
              }
              return networkRes;
            })
            .catch(() => {
              return caches.match('./app-icon.jpg');
            });
        });
      })
    );
    return;
  }

  // 2. APP SHELL (HTML, JS, CSS):
  // Network-First with Offline Cache Fallback so updates always appear immediately when online,
  // and the full app works when offline!
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(APP_CACHE).then((cache) => {
            cache.put(request, clone).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.destination === 'document') {
            return caches.match('./') || caches.match('./index.html');
          }
        });
      })
  );
});
