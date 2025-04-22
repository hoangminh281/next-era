"use client";

import { useEffect } from "react";

const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });

      if (registration.installing) {
        console.debug("[Service Worker] Installing...");
      } else if (registration.waiting) {
        console.debug("[Service Worker] Waiting...");
      } else if (registration.active) {
        console.debug("[Service Worker] Activated");
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};

const unregisterServiceWorker = async () => {
  console.log("[Service Worker] Unregistering...");

  const registrations = await navigator.serviceWorker.getRegistrations();

  registrations.forEach(async (registration) => {
    const isUnregister = await registration.unregister();

    if (isUnregister) {
      const cachesToDelete = await caches.keys();

      await Promise.all(
        cachesToDelete.map(async (key) => await caches.delete(key)),
      );
      console.debug("[Service Worker] Unregistered");
    }
  });
};

const NextEraWorker = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  useEffect(() => {}, []);

  useEffect(() => {
    if (isAuthenticated) {
      registerServiceWorker();
    } else {
      unregisterServiceWorker();
    }
  }, [isAuthenticated]);

  return null;
};

export default NextEraWorker;
