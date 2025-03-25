const CACHE_NAME = "v1";

interface CacheResources {
  (resources: string[]): Promise<void>;
}

/// <reference path="https://developer.chrome.com/docs/workbox/caching-strategies-overview" />
const STRATEGY = {
  CACHE_FIRST: async ({
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
    console.debug("[Service Worker][CF] Fetching URL: ", event.request.url);

    // First try to get the resource from the cache
    const responseFromCache = await caches.match(request);

    if (responseFromCache) {
      return responseFromCache;
    }

    // Next try to use (and cache) the preloaded response, if it's there
    const preloadResponse = await preloadResponsePromise;

    if (preloadResponse) {
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
  },
  NETWORK_FIRST: async ({
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
    console.debug("[Service Worker][NF] Fetching URL: ", event.request.url);

    // Next try to use (and cache) the preloaded response, if it's there
    const preloadResponse = await preloadResponsePromise;

    if (preloadResponse) {
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
      const fallbackFromCache = await caches.match(request);

      if (fallbackFromCache) {
        return fallbackFromCache;
      }

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
  },
  STALE_WHILE_REVALIDATE: async ({
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
    console.debug("[Service Worker][SWR] Fetching URL: ", event.request.url);

    // First try to get the resource from the cache
    const responseFromCache = await caches.match(request);
    const responseFromNetwork = new Promise<Response>(async (resolve) => {
      const responseFromPreload = await preloadResponsePromise;

      if (responseFromPreload) {
        event.waitUntil(putInCache(request, responseFromPreload.clone()));

        return resolve(responseFromPreload);
      }

      try {
        const response = await fetch(request);

        event.waitUntil(putInCache(request, response.clone()));

        return resolve(response);
      } catch {
        const fallbackResponse = await caches.match(fallbackUrl);

        if (fallbackResponse) {
          return resolve(fallbackResponse);
        }

        // when even the fallback response is not available,
        // there is nothing we can do, but we must always
        // return a Response object
        return resolve(
          new Response("Network error happened", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
          }),
        );
      }
    });

    return responseFromCache || responseFromNetwork;
  },
};

const selve = self as unknown as ServiceWorkerGlobalScope;

const wildcardize = (pattern: string) => {
  const regex = new RegExp(
    pattern
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\\\?/g, ".") // `?` → match any single character
      .replace(/\\\*\\\*/g, ".*") // `**` → match anything (including `/`)
      .replace(/\\\*/g, "[^/]*") + // `*` → match anything except `/`
      "$",
  );

  return (text: string) => {
    return regex.test(text);
  };
};

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

const enableNavigationPreload = async () => {
  if (selve.registration.navigationPreload) {
    await selve.registration.navigationPreload.enable();
  }
};

selve.addEventListener("install", (event) => {
  /* {{task.install}} */

  console.debug(
    `[Service Worker] Installing tasks: /* {{task.install}} */
    `,
  );

  const resources: string[] = /* {{resourcesToCache}} */ [];

  console.debug(
    `[Service Worker] Installing resources: ${resources.length}/${resources.length}`,
  );

  event.waitUntil(addResourcesToCache(resources));
});

selve.addEventListener("activate", (event) => {
  const task = /* {{task.activate}} */ Promise.resolve();

  event.waitUntil(enableNavigationPreload());
  event.waitUntil(deleteOldCaches());
  event.waitUntil(task);

  console.debug(
    `[Service Worker] Activating tasks: enableNavigationPreload, deleteOldCaches, /* {{task.activate}} */
    `,
  );
});

selve.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const nfURIs: string[] = /* {{strategy.nf}} */ [];

  if (nfURIs.some((nfURI) => wildcardize(nfURI)(event.request.url))) {
    return event.respondWith(
      STRATEGY.NETWORK_FIRST({
        request: event.request,
        preloadResponsePromise: event.preloadResponse,
        fallbackUrl: "",
        event,
      }),
    );
  }

  const swrURIs: string[] = /* {{strategy.swr}} */ [];

  if (swrURIs.some((swrURI) => wildcardize(swrURI)(event.request.url))) {
    return event.respondWith(
      STRATEGY.STALE_WHILE_REVALIDATE({
        request: event.request,
        preloadResponsePromise: event.preloadResponse,
        fallbackUrl: "",
        event,
      }),
    );
  }

  const cfURIS: string[] = /* {{strategy.cf}} */ [];

  if (cfURIS.some((cfURI) => wildcardize(cfURI)(event.request.url))) {
    event.respondWith(
      STRATEGY.CACHE_FIRST({
        request: event.request,
        preloadResponsePromise: event.preloadResponse,
        fallbackUrl: "",
        event,
      }),
    );
  }
});

selve.addEventListener("push", function () {
  console.debug("[Service Worker] Pushing...");
});
