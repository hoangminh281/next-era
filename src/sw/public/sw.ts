const CACHE_NAME = "v1";

interface CacheResources {
  (resources: string[]): Promise<void>;
}

const addResourcesToCache: CacheResources = async (resources) => {
  const cache = await caches.open(CACHE_NAME);

  await cache.addAll(resources);
};

const putInCache = async (request: Request, response: Response) => {
  const cache = await caches.open(CACHE_NAME);

  await cache.put(request, response);
};

const deleteCache = async (key: string) => {
  await caches.delete(key);
};

const deleteOldCaches = async () => {
  const cacheKeepList = [CACHE_NAME];
  const keyList = await caches.keys();
  const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));

  await Promise.all(cachesToDelete.map(deleteCache));
};

const cacheFirst = async ({
  request,
  preloadResponsePromise,
  fallbackUrl,
  event,
}: {
  request: Request;
  preloadResponsePromise: Promise<Response>;
  fallbackUrl: string;
  event: FetchEvent;
}) => {
  // First try to get the resource from the cache
  const responseFromCache = await caches.match(request);

  if (responseFromCache) {
    return responseFromCache;
  }

  // Next try to use (and cache) the preloaded response, if it's there
  const preloadResponse = await preloadResponsePromise;

  if (preloadResponse) {
    console.info("using preload response", preloadResponse);
    event.waitUntil(putInCache(request, preloadResponse.clone()));

    return preloadResponse;
  }

  // Next try to get the resource from the network
  try {
    const responseFromNetwork = await fetch(request);

    // response may be used only once
    // we need to save clone to put one copy in cache
    // and serve second one
    event.waitUntil(putInCache(request, responseFromNetwork.clone()));

    return responseFromNetwork;
  } catch {
    const fallbackResponse = await caches.match(fallbackUrl);

    if (fallbackResponse) {
      return fallbackResponse;
    }

    // when even the fallback response is not available,
    // there is nothing we can do, but we must always
    // return a Response object
    return new Response("Network error happened", {
      status: 408,
      headers: { "Content-Type": "text/plain" },
    });
  }
};

const selve = self as unknown as ServiceWorkerGlobalScope;

const enableNavigationPreload = async () => {
  if (selve.registration.navigationPreload) {
    await selve.registration.navigationPreload.enable();
  }
};

selve.addEventListener("activate", (event) => {
  event.waitUntil(enableNavigationPreload());
  event.waitUntil(deleteOldCaches());
});

selve.addEventListener("install", (event) => {
  event.waitUntil(addResourcesToCache([]));
});

selve.addEventListener("fetch", (event) => {
  event.respondWith(
    cacheFirst({
      request: event.request,
      preloadResponsePromise: event.preloadResponse,
      fallbackUrl: "/gallery/myLittleVader.jpg",
      event,
    })
  );
});
