// 缓存版本号，如果以后你更新了 css 或 js，修改这个名字（比如 'todo-v2'）
const CACHE_NAME = 'todo-ddl-v1';
// (重要!) 列出所有你需要缓存的核心文件
const urlsToCache = [
  '/', // '/' 代表网站的根目录，通常是 index.html
  'index.html',
  'style.css',
  'app.js',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

// 1. 安装 SW：在 SW "安装"时，打开缓存并存入文件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. 激活 SW：(可选) 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

// 3. 拦截请求：当网页请求资源时 (网络优先策略)
// 我们采用“网络优先”策略，这样如果你修改了代码，用户能看到最新版
// 但如果断网了，它会回退到使用缓存。
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // 如果网络请求成功，我们用它，并且更新缓存
        // (可选) 你可以检查是否是 http(s) 请求再缓存
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // 如果网络请求失败 (断网了)
        // 我们就去缓存里找
        console.log('SW: Fetch failed, trying cache...');
        return caches.match(event.request);
      })
  );
});