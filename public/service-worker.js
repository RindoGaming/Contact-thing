const CACHE_NAME = "pwa-cache-v1";
const urlsToCache = [
    "/",
    "index.html",
    "js/script.js",
    "js/map.js",
    "css/style.css",
    "circle.svg",
    "favicon.ico",
];

// Store response in cache
const putInCache = async (request, response) => {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response);
};

// Try to fetch from network, fallback to cache
const networkFirst = async (request) => {
    if (navigator.onLine) {
        try {
            const responseFromNetwork = await fetch(request);
            if (request.method === "GET") {
                putInCache(request, responseFromNetwork.clone());
            }
            return responseFromNetwork;
        } catch (e) {
            console.warn("[Service Worker] Network error, falling back to cache");
        }
    }

    if (request.method === "GET") {
        const responseFromCache = await caches.match(request);
        if (responseFromCache) {
            return responseFromCache;
        }
    }

    return new Response("Network error happened", {
        status: 408,
        headers: { "Content-Type": "text/plain" },
    });
};

self.addEventListener("fetch", (event) => {
    event.respondWith(networkFirst(event.request));
});

self.addEventListener("install", (event) => {
    const preCache = async () => {
        const cache = await caches.open(CACHE_NAME);
        return cache.addAll(urlsToCache);
    };
    event.waitUntil(preCache());
});
