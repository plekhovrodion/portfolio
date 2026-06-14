"use client";

import Image from "next/image";
import { X } from "lucide-react";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactPortal,
} from "react";
import { createPortal } from "react-dom";
import {
  assistantProductBrand,
  labProductBrand,
  profileProductBrand,
  vkMarketProductBrand,
  type CaseMetaBrand,
} from "@/lib/case-data";
import {
  CASE_LIGHTBOX_ANIMATION_MS,
  LIGHTBOX_SWIPE_THRESHOLD,
} from "@/lib/desktop-layout";
import { withBasePath } from "@/lib/site";

export { assistantProductBrand, labProductBrand, profileProductBrand, vkMarketProductBrand };
export type { CaseMetaBrand };

export function useMediaReady(source: string, isActive = true) {
  const [isReady, setIsReady] = useState(false);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);

  const syncReadyFromElement = useCallback(() => {
    const node = mediaRef.current;
    if (!node || !isActive) {
      return;
    }

    if (
      node instanceof HTMLImageElement &&
      node.complete &&
      node.naturalWidth > 0
    ) {
      setIsReady(true);
      return;
    }

    if (
      node instanceof HTMLVideoElement &&
      node.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      setIsReady(true);
    }
  }, [isActive]);

  useLayoutEffect(() => {
    setIsReady(false);
    syncReadyFromElement();
  }, [source, isActive, syncReadyFromElement]);

  const markReady = useCallback(() => {
    if (isActive) {
      setIsReady(true);
    }
  }, [isActive]);

  const bindMediaRef = useCallback(
    (node: HTMLImageElement | HTMLVideoElement | null) => {
      mediaRef.current = node;
      if (node) {
        syncReadyFromElement();
      }
    },
    [syncReadyFromElement],
  );

  return {
    isReady: isActive ? isReady : false,
    markReady,
    bindMediaRef,
  };
}

export function MediaSkeleton({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={`media-skeleton ${className ?? ""}`}
      style={style}
    />
  );
}

export function CaseVideo({
  src,
  title,
  mimeType = "video/mp4",
}: {
  src: string;
  title: string;
  mimeType?: string;
}) {
  const { isReady, markReady, bindMediaRef } = useMediaReady(src);

  return (
    <div className="case-video-frame">
      {!isReady ? (
        <MediaSkeleton className="absolute inset-0 rounded-[inherit]" />
      ) : null}
      <video
        ref={bindMediaRef}
        className={`case-video-frame__player ${isReady ? "media-loaded" : "media-loading"}`}
        controls
        playsInline
        preload="metadata"
        aria-label={title}
        onLoadedData={markReady}
      >
        <source src={src} type={mimeType} />
      </video>
    </div>
  );
}

const MOTION_PREFETCH_STAGGER_MS = 120;

export function prefetchMotionVideos(sources: ReadonlyArray<string>) {
  const links: HTMLLinkElement[] = [];
  const timeoutIds: number[] = [];

  sources.forEach((source, index) => {
    const timeoutId = window.setTimeout(() => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "video";
      link.href = source;
      document.head.append(link);
      links.push(link);
    }, index * MOTION_PREFETCH_STAGGER_MS);
    timeoutIds.push(timeoutId);
  });

  return () => {
    timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    links.forEach((link) => link.remove());
  };
}

export function CaseMotionVideo({
  src,
  className,
  mimeType = "video/webm",
  isPlaying = false,
  isVisible = true,
  keepLoaded = false,
  mode = "preview",
}: {
  src: string;
  className?: string;
  mimeType?: string;
  isPlaying?: boolean;
  isVisible?: boolean;
  keepLoaded?: boolean;
  mode?: "preview" | "lightbox";
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadedSrcRef = useRef<string | null>(null);
  const shouldLoad = mode === "lightbox" ? isPlaying : isVisible;
  const { isReady, markReady, bindMediaRef } = useMediaReady(src, shouldLoad);

  const setVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      bindMediaRef(node);
    },
    [bindMediaRef],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) {
      return;
    }

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markReady();
    }
  }, [markReady, shouldLoad, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = true;

    if (!shouldLoad) {
      video.pause();
      if (!keepLoaded && loadedSrcRef.current) {
        video.removeAttribute("src");
        video.load();
        loadedSrcRef.current = null;
      }
      return;
    }

    if (loadedSrcRef.current !== src) {
      video.src = src;
      video.load();
      loadedSrcRef.current = src;
    }

    if (!isPlaying) {
      video.pause();
      if (video.readyState >= 1) {
        video.currentTime = 0.001;
      }
      return;
    }

    const element = video;

    function playWhenBuffered() {
      void element.play().catch(() => {
        // Autoplay can be blocked until the user interacts with the page.
      });
    }

    if (element.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      playWhenBuffered();
      return;
    }

    element.addEventListener("canplay", playWhenBuffered, { once: true });

    return () => {
      element.removeEventListener("canplay", playWhenBuffered);
    };
  }, [shouldLoad, isPlaying, src, mode, keepLoaded]);

  function showPosterFrame(video: HTMLVideoElement) {
    if (isPlaying) {
      return;
    }

    video.pause();
    video.currentTime = 0.001;
  }

  function handleLoadedData(event: React.SyntheticEvent<HTMLVideoElement>) {
    showPosterFrame(event.currentTarget);
    markReady();
  }

  const preload =
    mode === "lightbox"
      ? "auto"
      : shouldLoad && isPlaying
        ? "auto"
        : shouldLoad
          ? "metadata"
          : "none";

  return (
    <>
      {shouldLoad && !isReady ? (
        <MediaSkeleton className="absolute inset-0 z-[1] rounded-[inherit]" />
      ) : null}
      <video
        ref={setVideoRef}
        className={`${className ?? ""} ${isReady ? "media-loaded" : "media-loading"}`}
        loop
        muted
        playsInline
        preload={preload}
        onLoadedMetadata={handleLoadedData}
        onLoadedData={handleLoadedData}
      />
    </>
  );
}

export type MotionVideo = {
  src: string;
  title: string;
  mimeType?: string;
};

type CursorPosition = {
  x: number;
  y: number;
};

export const motionPromoVideo: MotionVideo = {
  src: withBasePath("/assistant-promo.webm"),
  title: "Ассистент преподавателя",
  mimeType: "video/webm",
};

export const motionGridVideos: MotionVideo[] = [
  { src: withBasePath("/motion/landing-student-ai-mentor.webm"), title: "ИИ-наставник для ученика" },
  { src: withBasePath("/motion/landing-student-ai-career.webm"), title: "ИИ-профориентолог" },
  {
    src: withBasePath("/motion/landing-hero.mp4"),
    title: "Hero-блок лендинга",
    mimeType: "video/mp4",
  },
  { src: withBasePath("/motion/landing-student-ai-tutor.webm"), title: "ИИ-репетитор" },
  {
    src: withBasePath("/motion/landing-teacher-personalized.webm"),
    title: "Персонализированное обучение",
  },
  { src: withBasePath("/motion/landing-teacher-ai-tasks.webm"), title: "Создание заданий с ИИ" },
  {
    src: withBasePath("/motion/landing-teacher-methodology.webm"),
    title: "Методическая поддержка",
  },
  { src: withBasePath("/motion/brand-staging-opener.webm"), title: "Заставка логотипа" },
  { src: withBasePath("/motion/ui-toggle.webm"), title: "Переключатель интерфейса" },
  { src: withBasePath("/motion/block-fgos.webm"), title: "Справочник ФГОС" },
  { src: withBasePath("/motion/brand-gold-logo.webm"), title: "Золотой логотип" },
  { src: withBasePath("/motion/capture-8490.webm"), title: "Запись с устройства" },
  { src: withBasePath("/motion/capture-7042.webm"), title: "Демо интерфейса" },
  { src: withBasePath("/motion/brand-render-hd.webm"), title: "Рендер логотипа · Full HD" },
  { src: withBasePath("/motion/ui-composition.webm"), title: "Композиция интерфейса" },
  { src: withBasePath("/motion/ui-final-comps.webm"), title: "Финальная композиция" },
  { src: withBasePath("/motion/brand-render-3.webm"), title: "Рендер логотипа · вариант 3" },
  { src: withBasePath("/motion/ui-screen-closeup.webm"), title: "Крупный план экрана" },
];

export const motionPlaylist = [motionPromoVideo, ...motionGridVideos];

export function getMotionVideoLayout(index: number): "wide" | "square" {
  return index % 3 === 0 ? "wide" : "square";
}

export function useLightboxGalleryNavigation({
  itemCount,
  currentIndex,
  onIndexChange,
  onClose,
  isEnabled,
}: {
  itemCount: number;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  isEnabled: boolean;
}) {
  const canNavigate = itemCount > 1;
  const swipeStartRef = useRef<CursorPosition | null>(null);

  const goToPrevious = useCallback(() => {
    if (!canNavigate || currentIndex <= 0) {
      return;
    }

    onIndexChange(currentIndex - 1);
  }, [canNavigate, currentIndex, onIndexChange]);

  const goToNext = useCallback(() => {
    if (!canNavigate || currentIndex >= itemCount - 1) {
      return;
    }

    onIndexChange(currentIndex + 1);
  }, [canNavigate, currentIndex, itemCount, onIndexChange]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        onClose();
        return;
      }

      if (!canNavigate) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        event.stopPropagation();
        goToPrevious();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        event.stopPropagation();
        goToNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [canNavigate, goToNext, goToPrevious, isEnabled, onClose]);

  const bindSwipeHandlers = useCallback(() => {
    return {
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
        if (!canNavigate || !isEnabled) {
          return;
        }

        swipeStartRef.current = {
          x: event.clientX,
          y: event.clientY,
        };
      },
      onPointerUp: (event: ReactPointerEvent<HTMLElement>) => {
        const start = swipeStartRef.current;
        swipeStartRef.current = null;

        if (!start || !canNavigate || !isEnabled) {
          return;
        }

        const deltaX = event.clientX - start.x;
        const deltaY = event.clientY - start.y;

        if (Math.abs(deltaX) < LIGHTBOX_SWIPE_THRESHOLD) {
          return;
        }

        if (Math.abs(deltaX) < Math.abs(deltaY)) {
          return;
        }

        if (deltaX < 0) {
          goToNext();
          return;
        }

        goToPrevious();
      },
      onPointerCancel: () => {
        swipeStartRef.current = null;
      },
    };
  }, [canNavigate, goToNext, goToPrevious, isEnabled]);

  return {
    canNavigate,
    goToPrevious,
    goToNext,
    bindSwipeHandlers,
  };
}

export function CaseVideoLightbox({
  videos,
  index,
  isClosing,
  onClose,
  onIndexChange,
}: {
  videos: ReadonlyArray<MotionVideo>;
  index: number;
  isClosing: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const video = videos[index];
  const shouldPlayOpenAnimationRef = useRef(true);
  const { bindSwipeHandlers } = useLightboxGalleryNavigation({
    itemCount: videos.length,
    currentIndex: index,
    onIndexChange,
    onClose,
    isEnabled: !isClosing,
  });

  useEffect(() => {
    shouldPlayOpenAnimationRef.current = false;
  }, [index]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className={`case-image-lightbox ${
        isClosing
          ? "case-image-lightbox--closing"
          : "case-image-lightbox--opening"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={
        videos.length > 1
          ? `${video.title} (${index + 1} из ${videos.length})`
          : video.title
      }
      onClick={onClose}
    >
      <div
        className="case-image-lightbox__frame"
        onClick={(event) => event.stopPropagation()}
        {...bindSwipeHandlers()}
      >
        <CaseMotionVideo
          key={video.src}
          src={video.src}
          mimeType={video.mimeType}
          mode="lightbox"
          isPlaying={!isClosing}
          className={`case-image-lightbox__image case-image-lightbox__video ${
            isClosing
              ? "case-image-lightbox__image--closing"
              : shouldPlayOpenAnimationRef.current
                ? "case-image-lightbox__image--opening"
                : ""
          }`}
        />
      </div>
      <button
        type="button"
        aria-label="Закрыть просмотр видео"
        className="case-image-lightbox__close grid size-10 place-items-center rounded-full bg-white/10 text-white/90 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        <X aria-hidden="true" className="size-5" strokeWidth={2.2} />
      </button>
    </div>
  );
}

export function MotionVideoTile({
  video,
  layout,
  onOpen,
  autoPlayWhenVisible = false,
}: {
  video: MotionVideo;
  layout: "wide" | "square";
  onOpen: (video: MotionVideo) => void;
  autoPlayWhenVisible?: boolean;
}) {
  const tileRef = useRef<HTMLButtonElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHoverPlaying, setIsHoverPlaying] = useState(false);
  const isPlaying = autoPlayWhenVisible ? isVisible : isHoverPlaying;

  useEffect(() => {
    const element = tileRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (!entry.isIntersecting) {
          setIsHoverPlaying(false);
        }
      },
      { rootMargin: "320px" },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <button
      ref={tileRef}
      type="button"
      className={`case-zoomable-video bg-white/10 ${
        layout === "wide" ? "case-motion-item--wide" : "case-motion-item--square"
      }`}
      onMouseEnter={autoPlayWhenVisible ? undefined : () => setIsHoverPlaying(true)}
      onMouseLeave={autoPlayWhenVisible ? undefined : () => setIsHoverPlaying(false)}
      onFocus={autoPlayWhenVisible ? undefined : () => setIsHoverPlaying(true)}
      onBlur={autoPlayWhenVisible ? undefined : () => setIsHoverPlaying(false)}
      onClick={() => onOpen(video)}
      aria-label={`Открыть на весь экран: ${video.title}`}
    >
      <CaseMotionVideo
        src={video.src}
        mimeType={video.mimeType}
        mode="preview"
        isVisible={isVisible}
        isPlaying={isPlaying}
        keepLoaded
        className="case-zoomable-video__player"
      />
    </button>
  );
}

export function CaseMotionGrid({
  videos,
}: {
  videos: ReadonlyArray<MotionVideo>;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isLightboxClosing, setIsLightboxClosing] = useState(false);
  const lightboxCloseTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return prefetchMotionVideos(videos.map((video) => video.src));
  }, [videos]);

  useEffect(() => {
    return () => {
      if (lightboxCloseTimeoutRef.current) {
        window.clearTimeout(lightboxCloseTimeoutRef.current);
      }
    };
  }, []);

  function openLightbox(video: MotionVideo) {
    const index = videos.findIndex((item) => item.src === video.src);
    if (index === -1) {
      return;
    }

    if (lightboxCloseTimeoutRef.current) {
      window.clearTimeout(lightboxCloseTimeoutRef.current);
      lightboxCloseTimeoutRef.current = null;
    }

    setIsLightboxClosing(false);
    setLightboxIndex(index);
  }

  function closeLightbox() {
    if (lightboxIndex === null || isLightboxClosing) {
      return;
    }

    setIsLightboxClosing(true);
    lightboxCloseTimeoutRef.current = window.setTimeout(() => {
      setLightboxIndex(null);
      setIsLightboxClosing(false);
      lightboxCloseTimeoutRef.current = null;
    }, CASE_LIGHTBOX_ANIMATION_MS);
  }

  function changeLightboxIndex(index: number) {
    if (index < 0 || index >= videos.length) {
      return;
    }

    if (lightboxCloseTimeoutRef.current) {
      window.clearTimeout(lightboxCloseTimeoutRef.current);
      lightboxCloseTimeoutRef.current = null;
    }

    setIsLightboxClosing(false);
    setLightboxIndex(index);
  }

  return (
    <>
      <div className="case-motion-layout mx-auto w-full">
        {videos.map((video, index) => (
          <MotionVideoTile
            key={video.src}
            video={video}
            layout={getMotionVideoLayout(index)}
            autoPlayWhenVisible
            onOpen={openLightbox}
          />
        ))}
      </div>
      {lightboxIndex !== null
        ? createPortal(
            <CaseVideoLightbox
              videos={videos}
              index={lightboxIndex}
              isClosing={isLightboxClosing}
              onClose={closeLightbox}
              onIndexChange={changeLightboxIndex}
            />,
            document.body,
          )
        : null}
    </>
  );
}