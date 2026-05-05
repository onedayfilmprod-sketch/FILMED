const CACHE = 'snimki-v3';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon.png',
  './bg1.JPG',
  './bg2.JPG',
  './bg3.JPG',
  './bg4.JPG',
  './bg5.JPG',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Bebas+Neue&family=Cormorant+Garamond:wght@700&family=Oswald:wght@600&family=DM+Serif+Display&family=Raleway:wght@400;500;600;700;800&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.allSettled(ASSETS.map(url => c.add(url).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached))
  );
});
