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
        console.log("[Service Worker] Installing...");
      } else if (registration.waiting) {
        console.log("[Service Worker] Waiting...");
      } else if (registration.active) {
        console.log("[Service Worker] Activated");
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};

const NextEraWorker = () => {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
};

export default NextEraWorker;
