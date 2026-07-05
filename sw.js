// Версию нужно поднимать при каждом деплое, чтобы старые клиенты
// гарантированно подхватили новый код (главная причина "залипания"
// старого экрана на iPhone — старый кэш, отдаваемый раньше сети).
const CACHE = 'snimki-v18';

// Файлы, которые должны ВСЕГДА приходить из сети в первую очередь
// (html/css/js) — чтобы правки на GitHub Pages сразу были видны.
const NETWORK_FIRST = ['/index.html', '/style.css', '/sw.js', '.html', '.css', '.js'];

// Статика (шрифты, картинки, manifest) — можно кэш-фёрст,
// она меняется редко.
const CACHE_FIRST_ASSETS = [
  './manifest.json',
  './icon.png',
  './bg1.JPG',
  './bg2.JPG',
  './bg3.JPG',
  './bg4.JPG',
  './bg5.JPG',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.allSettled(CACHE_FIRST_ASSETS.map(url => c.add(url).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

function isNetworkFirst(url) {
  return NETWORK_FIRST.some(pattern => url.includes(pattern));
}

self.addEventListener('fetch', e => {
  const url = e.request.url;

  if (isNetworkFirst(url)) {
    // Network-first: пробуем сеть, кэш — только как fallback офлайн.
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return resp;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first для статики.
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached))
  );
});
