// 缓存版本号
const CACHE_NAME = 'todo-ddl-v2'; // v2 是因为我们更新了 app.js
// (重要!) 列出所有你需要缓存的核心文件
const urlsToCache = [
  '/', // '/' 代表网站的根目录
  'index.html',
  'style.css',
  'app.js',
  'manifest.json', // 也缓存 manifest
  'icons/icon-192.png',
  'icons/icon-512.png'
];

// 1. 安装 SW
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. 激活 SW：清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        // 删除所有不等于 CACHE_NAME 的旧缓存
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

// 3. 拦截请求：优先使用缓存 (Cache First)
// 这会让你的应用加载非常快，并且能离线运行
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中有匹配的，直接返回缓存的
        if (response) {
          return response;
        }
        
        // 如果缓存中没有，才去网络上请求
        // 并且把请求到的新资源存入缓存
        return fetch(event.request).then(
          networkResponse => {
            // 检查响应是否有效
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // 复制一份响应，因为响应体只能被读取一次
            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return networkResponse;
          }
        );
      })
  );
});