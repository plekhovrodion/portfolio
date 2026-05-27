"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { withBasePath } from "@/lib/site";

const MIN_VISIBLE_MS = 750;
const MAX_WAIT_MS = 5500;
const EXIT_MS = 480;

type PreloaderPhase = "loading" | "exiting" | "done";

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function waitForWindowLoad() {
  if (document.readyState === "complete") {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();
    image.src = src;
    image.onload = () => resolve();
    image.onerror = () => resolve();
  });
}

function waitForBackgroundVideo(
  videoRef: RefObject<HTMLVideoElement | null>,
) {
  return new Promise<void>((resolve) => {
    const video = videoRef.current;

    if (!video) {
      resolve();
      return;
    }

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      resolve();
      return;
    }

    function handleReady() {
      resolve();
    }

    video.addEventListener("canplay", handleReady, { once: true });
    video.addEventListener("loadeddata", handleReady, { once: true });
    video.addEventListener("error", handleReady, { once: true });
  });
}

export function useSitePreloader(
  backgroundVideoRef: RefObject<HTMLVideoElement | null>,
) {
  const [phase, setPhase] = useState<PreloaderPhase>("loading");
  const startedAtRef = useRef(Date.now());
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    if (hasFinishedRef.current) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    async function finishLoading() {
      if (hasFinishedRef.current) {
        return;
      }

      hasFinishedRef.current = true;

      if (prefersReducedMotion) {
        setPhase("done");
        return;
      }

      const elapsed = Date.now() - startedAtRef.current;
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
      if (remaining > 0) {
        await wait(remaining);
      }

      setPhase("exiting");
      await wait(EXIT_MS);
      setPhase("done");
    }

    const maxTimeoutId = window.setTimeout(() => {
      void finishLoading();
    }, MAX_WAIT_MS);

    void Promise.all([
      waitForWindowLoad(),
      preloadImage(withBasePath("/profile.png")),
      waitForBackgroundVideo(backgroundVideoRef),
    ]).then(() => {
      window.clearTimeout(maxTimeoutId);
      void finishLoading();
    });

    return () => {
      window.clearTimeout(maxTimeoutId);
    };
  }, [backgroundVideoRef]);

  return {
    isActive: phase !== "done",
    isExiting: phase === "exiting",
  };
}

export function SitePreloaderOverlay({ isExiting }: { isExiting: boolean }) {
  return (
    <div
      className={`site-preloader ${isExiting ? "site-preloader--exiting" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Загрузка портфолио"
    >
      <div className="site-preloader__inner">
        <div className="site-preloader__status">
          <span className="site-preloader__dot" aria-hidden="true" />
          <p className="site-preloader__label desktop-label">Родион Плехов</p>
        </div>
        <div className="site-preloader__bar" aria-hidden="true">
          <span className="site-preloader__bar-fill" />
        </div>
      </div>
    </div>
  );
}
