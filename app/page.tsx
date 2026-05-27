"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Maximize2,
  Music,
  Pause,
  X,
} from "lucide-react";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import { useCallback, useEffect, useRef, useState, type ReactPortal } from "react";
import { withBasePath } from "@/lib/site";
import { createPortal } from "react-dom";

type DesktopFile = {
  id: string;
  label: string;
  x: number;
  y: number;
  variant?: "folder";
};

type Position = {
  x: number;
  y: number;
};

type DragTarget =
  | {
      type: "file";
      id: string;
    }
  | {
      type: "card";
    }
  | {
      type: "case-window";
    };

type DragState = {
  target: DragTarget;
  offsetX: number;
  offsetY: number;
  startX: number;
  startY: number;
  width: number;
  height: number;
  hasMoved: boolean;
};

type StageSize = {
  width: number;
  height: number;
};

const STAGE_WIDTH = 1600;
const STAGE_HEIGHT = 1024;
const HEADER_HEIGHT = 56;
const FILE_WIDTH = 128;
const FILE_HEIGHT = 132;
const CARD_WIDTH = 480;
const CARD_HEIGHT = 248;
const CASE_WINDOW_WIDTH = 832;
const CASE_WINDOW_HEIGHT = 780;
const CASE_WINDOW_ANIMATION_MS = 220;
const CASE_LIGHTBOX_ANIMATION_MS = 220;
const MOBILE_LAYOUT_BREAKPOINT = 900;
const NARROW_MOBILE_BREAKPOINT = 520;
const MOBILE_FILE_COLUMNS = 3;
const MUSIC_BACKGROUND_VIDEO = withBasePath("/dancing-rat-chess-type-beat.webm");

const vkCartFigmaPrototype =
  "https://www.figma.com/proto/1C93yxYA4hkGBogyImvYgE/%D0%A2%D0%B5%D1%81%D1%82%D0%BE%D0%B2%D0%BE%D0%B5-%D0%B7%D0%B0%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5-VK-%D0%9C%D0%B0%D1%80%D0%BA%D0%B5%D1%82-%D0%9A%D0%BE%D1%80%D0%B7%D0%B8%D0%BD%D0%B0-%C2%B7-%D0%9F%D0%BB%D0%B5%D1%85%D0%BE%D0%B2-%D0%A0%D0%BE%D0%B4%D0%B8%D0%BE%D0%BD?node-id=2-8527&viewport=-7125%2C68%2C0.66&scaling=scale-down&starting-point-node-id=2%3A8527&show-proto-sidebar=1&page-id=0%3A1";

const inlineLinkClassName =
  "rounded-sm underline decoration-white/35 underline-offset-2 transition hover:text-white/80 hover:decoration-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

const desktopFilePreviews: Partial<Record<string, string>> = {
  home: withBasePath("/desktop-previews/home.png"),
  classes: withBasePath("/desktop-previews/classes.png"),
  profile: withBasePath("/desktop-previews/profile.png"),
  "ai-assistant": withBasePath("/desktop-previews/ai-assistant.png"),
  subscription: withBasePath("/desktop-previews/subscription.png"),
  "vk-cart": withBasePath("/desktop-previews/vk-cart.png"),
};

const caseWindowTitles: Record<string, string> = {
  "about-me": "Обо мне",
  motion: "Моушн",
  home: "Главная страница Лаборатории заданий",
  classes: "Статистика занятий",
  "ai-assistant": "ИИ-помощник в Лаборатории заданий",
  subscription: "Тарифы в Лаборатории заданий",
  "vk-cart": "Корзина ВК Маркет — тестовое задание",
};

type AboutMeHighlight = {
  title: string;
  description: string;
  href?: string;
};

const aboutMeProductHighlights: ReadonlyArray<AboutMeHighlight> = [
  {
    title: "Ассистент преподавателя (2023–2026)",
    description: "150к+ пользователей, 57 регионов РФ",
    href: "https://edu-assist.me/promo",
  },
  {
    title: "Единый профиль СберОбразования (2023–2024)",
    description: "350к+ пользователей",
    href: "https://app.edu-assist.me/profile",
  },
  {
    title: "Лаборатория заданий (2025)",
    description: "1000+ платящих после запуска подписок",
    href: "https://edu-assist.ru/",
  },
  {
    title: "UI Kit (2026)",
    description: "темизация, покрытие 90% сценариев",
  },
  {
    title: "ИИ-помощник (2026)",
    description: "20к+ чатов",
    href: "https://app.edu-assist.me/ai",
  },
];

const aboutMeTeamHighlights: ReadonlyArray<AboutMeHighlight> = [
  {
    title: "Исследования",
    description:
      "внедрил немодерируемые исследования через PathWay (команда 10+ чел.)",
  },
  {
    title: "Менторство",
    description: "обучаю стажёров: курс по дизайну, митапы по Cursor",
  },
  {
    title: "Процессы",
    description: "создал чек‑лист проверки макетов и шаблон сценариев",
  },
];

const desktopFiles: DesktopFile[] = [
  { id: "home", label: "Главная", x: 289, y: 154 },
  { id: "classes", label: "Статистика занятий", x: 804, y: 190 },
  { id: "ai-assistant", label: "ИИ-помощник", x: 548, y: 480 },
  { id: "subscription", label: "Тарифы", x: 261, y: 584 },
  { id: "vk-cart", label: "Корзина", x: 613, y: 831 },
  { id: "profile", label: "Профиль", x: 1087, y: 716 },
  { id: "motion", label: "Моушн", x: 437, y: 328, variant: "folder" },
];

function formatCurrentTime() {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getCaseWindowSize(stageSize: StageSize) {
  return {
    width: Math.min(CASE_WINDOW_WIDTH, stageSize.width),
    height: Math.min(CASE_WINDOW_HEIGHT, stageSize.height - HEADER_HEIGHT),
  };
}

function getCaseWindowPositionForCase(
  caseId: string,
  stageSize: StageSize,
  files: readonly DesktopFile[],
  cardPosition: Position,
) {
  if (stageSize.width <= MOBILE_LAYOUT_BREAKPOINT) {
    return { x: 0, y: HEADER_HEIGHT };
  }

  const windowSize = getCaseWindowSize(stageSize);
  let anchor = { x: 44, y: 68 };

  if (caseId === "about-me") {
    anchor = cardPosition;
  } else {
    const file = files.find((item) => item.id === caseId);
    if (file) {
      anchor = { x: file.x, y: file.y };
    }
  }

  return {
    x: clamp(anchor.x, 0, Math.max(0, stageSize.width - windowSize.width)),
    y: clamp(
      anchor.y,
      HEADER_HEIGHT,
      Math.max(HEADER_HEIGHT, stageSize.height - windowSize.height),
    ),
  };
}

function getMobileFilePosition(index: number, stageSize: StageSize) {
  const isNarrow = stageSize.width <= NARROW_MOBILE_BREAKPOINT;
  const sidePadding = isNarrow ? 8 : 14;
  const rowGap = isNarrow ? 116 : 130;
  const availableWidth = stageSize.width - sidePadding * 2;
  const cellWidth = availableWidth / MOBILE_FILE_COLUMNS;
  const fileWidth = Math.min(FILE_WIDTH, cellWidth);
  const column = index % MOBILE_FILE_COLUMNS;
  const row = Math.floor(index / MOBILE_FILE_COLUMNS);
  const x = sidePadding + column * cellWidth + (cellWidth - fileWidth) / 2;
  const y = HEADER_HEIGHT + (isNarrow ? 232 : 228) + row * rowGap;

  return {
    x: clamp(x, 0, Math.max(0, stageSize.width - fileWidth)),
    y,
  };
}

function getMobileCardPosition(stageSize: StageSize) {
  const sidePadding = stageSize.width <= NARROW_MOBILE_BREAKPOINT ? 8 : 14;

  return {
    x: sidePadding,
    y: HEADER_HEIGHT + 8,
  };
}

const DESKTOP_STAGE_PADDING = 40;

const desktopFileOrbitOffsets: Record<string, Position> = {
  home: { x: -460, y: -320 },
  classes: { x: 48, y: -380 },
  "ai-assistant": { x: 480, y: -300 },
  profile: { x: 560, y: 70 },
  "vk-cart": { x: 440, y: 360 },
  subscription: { x: -72, y: 420 },
  motion: { x: -540, y: 100 },
};

const DESKTOP_FILE_CLEARANCE = 56;

function getDesktopCardPosition(stageSize: StageSize): Position {
  const cardWidth = Math.min(
    CARD_WIDTH,
    stageSize.width - DESKTOP_STAGE_PADDING * 2,
  );
  const usableHeight = stageSize.height - HEADER_HEIGHT - 24;

  return {
    x: Math.max(DESKTOP_STAGE_PADDING, (stageSize.width - cardWidth) / 2),
    y: HEADER_HEIGHT + Math.max(16, (usableHeight - CARD_HEIGHT) / 2),
  };
}

function clampDesktopFilePosition(position: Position, stageSize: StageSize) {
  const padding = 16;
  const minY = HEADER_HEIGHT + 8;
  const maxX = Math.max(padding, stageSize.width - FILE_WIDTH - padding);
  const maxY = Math.max(minY, stageSize.height - FILE_HEIGHT - padding);

  return {
    x: clamp(position.x, padding, maxX),
    y: clamp(position.y, minY, maxY),
  };
}

function resolveFilePositionAvoidingCard(
  position: Position,
  cardBounds: { left: number; top: number; right: number; bottom: number },
  cardCenter: Position,
  stageSize: StageSize,
) {
  const iconBounds = {
    left: position.x,
    top: position.y,
    right: position.x + FILE_WIDTH,
    bottom: position.y + FILE_HEIGHT,
  };

  const intersectsCard =
    iconBounds.left < cardBounds.right + DESKTOP_FILE_CLEARANCE &&
    iconBounds.right > cardBounds.left - DESKTOP_FILE_CLEARANCE &&
    iconBounds.top < cardBounds.bottom + DESKTOP_FILE_CLEARANCE &&
    iconBounds.bottom > cardBounds.top - DESKTOP_FILE_CLEARANCE;

  if (!intersectsCard) {
    return clampDesktopFilePosition(position, stageSize);
  }

  const iconCenterX = position.x + FILE_WIDTH / 2;
  const iconCenterY = position.y + FILE_HEIGHT / 2;
  const dx = iconCenterX - cardCenter.x;
  const dy = iconCenterY - cardCenter.y;
  const distance = Math.hypot(dx, dy) || 1;
  const cardHalfWidth = (cardBounds.right - cardBounds.left) / 2;
  const cardHalfHeight = (cardBounds.bottom - cardBounds.top) / 2;
  const minDistance =
    Math.hypot(cardHalfWidth, cardHalfHeight) +
    Math.hypot(FILE_WIDTH / 2, FILE_HEIGHT / 2) +
    DESKTOP_FILE_CLEARANCE;

  return clampDesktopFilePosition(
    {
      x: cardCenter.x + (dx / distance) * minDistance - FILE_WIDTH / 2,
      y: cardCenter.y + (dy / distance) * minDistance - FILE_HEIGHT / 2,
    },
    stageSize,
  );
}

function getDesktopFileOrbitPositions(
  filesList: readonly DesktopFile[],
  stageSize: StageSize,
  cardPosition: Position,
): DesktopFile[] {
  const cardWidth = Math.min(
    CARD_WIDTH,
    stageSize.width - DESKTOP_STAGE_PADDING * 2,
  );
  const centerX = cardPosition.x + cardWidth / 2;
  const centerY = cardPosition.y + CARD_HEIGHT / 2;
  const cardCenter = { x: centerX, y: centerY };
  const cardBounds = {
    left: cardPosition.x,
    top: cardPosition.y,
    right: cardPosition.x + cardWidth,
    bottom: cardPosition.y + CARD_HEIGHT,
  };
  const orbitScale = clamp(
    Math.min(
      (stageSize.width - cardWidth) / (STAGE_WIDTH - CARD_WIDTH),
      (stageSize.height - HEADER_HEIGHT - CARD_HEIGHT) /
        (STAGE_HEIGHT - HEADER_HEIGHT - CARD_HEIGHT),
    ),
    0.72,
    1.08,
  );

  return filesList.map((file) => {
    const offset = desktopFileOrbitOffsets[file.id] ?? { x: 0, y: 0 };
    const iconCenterX = centerX + offset.x * orbitScale;
    const iconCenterY = centerY + offset.y * orbitScale;
    const position = {
      x: iconCenterX - FILE_WIDTH / 2,
      y: iconCenterY - FILE_HEIGHT / 2,
    };

    return {
      ...file,
      ...resolveFilePositionAvoidingCard(
        position,
        cardBounds,
        cardCenter,
        stageSize,
      ),
    };
  });
}

function DesktopFilePreview({ src }: { src: string }) {
  const { isReady, markReady } = useMediaReady(src);

  return (
    <>
      {!isReady ? <MediaSkeleton className="absolute inset-0" /> : null}
      <Image
        src={src}
        alt=""
        fill
        sizes="96px"
        unoptimized
        className={`object-cover ${isReady ? "media-loaded" : "media-loading"}`}
        onLoad={markReady}
      />
    </>
  );
}

function DesktopFileIcon({
  file,
  isDragging,
  index,
  onDragStart,
}: {
  file: DesktopFile;
  isDragging: boolean;
  index: number;
  onDragStart: (
    event: ReactPointerEvent<HTMLButtonElement>,
    target: DragTarget,
    position: Position,
    elementSize?: StageSize,
  ) => void;
}) {
  return (
    <button
      type="button"
      className={`desktop-file group absolute flex w-32 touch-none select-none appearance-none flex-col items-center gap-2 border-0 bg-transparent p-0 focus-visible:outline-none ${
        isDragging ? "z-20 cursor-grabbing" : "cursor-grab"
      }`}
      style={
        {
          left: file.x,
          top: file.y,
          "--appear-delay": `${120 + index * 55}ms`,
        } as CSSProperties
      }
      onPointerDown={(event) =>
        onDragStart(event, { type: "file", id: file.id }, file)
      }
    >
      <div className="desktop-file-icon rounded-[24px] border border-white/0 p-4 transition duration-200 group-hover:border-white/35 group-hover:bg-black/15 group-focus-visible:border-white/35 group-focus-visible:bg-black/15 group-focus-visible:outline-none">
        {file.variant === "folder" ? (
          <div className="relative h-[72px] w-24 transition duration-200 group-hover:scale-[1.04] group-focus-visible:scale-[1.04]">
            <Image
              src={withBasePath("/icons/folder.svg")}
              alt=""
              fill
              sizes="96px"
              unoptimized
              className="object-contain drop-shadow-[0_0_12px_rgba(0,0,0,0.16)]"
            />
          </div>
        ) : (
          <div className="relative h-[72px] w-24 overflow-hidden rounded-lg bg-[#fafafa] shadow-[0_0_12px_rgba(0,0,0,0.16)] transition duration-200 group-hover:scale-[1.04] group-focus-visible:scale-[1.04]">
            {desktopFilePreviews[file.id] ? (
              <DesktopFilePreview src={desktopFilePreviews[file.id]!} />
            ) : null}
          </div>
        )}
      </div>
      <p className="desktop-label max-w-32 text-center text-base font-semibold leading-5 tracking-[-0.2px] text-[#fafafa]">
        {file.label}
      </p>
    </button>
  );
}

function useMediaReady(source: string, isActive = true) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);
  }, [source, isActive]);

  const markReady = useCallback(() => {
    setIsReady(true);
  }, []);

  return { isReady: isActive ? isReady : false, markReady };
}

function MediaSkeleton({
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

function CaseVideo({
  src,
  title,
  mimeType = "video/mp4",
}: {
  src: string;
  title: string;
  mimeType?: string;
}) {
  const { isReady, markReady } = useMediaReady(src);

  return (
    <div className="case-video-frame">
      {!isReady ? (
        <MediaSkeleton className="absolute inset-0 rounded-[inherit]" />
      ) : null}
      <video
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

function prefetchMotionVideos(sources: ReadonlyArray<string>) {
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

function CaseMotionVideo({
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
  const { isReady, markReady } = useMediaReady(src, shouldLoad);

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
        ref={videoRef}
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

type MotionVideo = {
  src: string;
  title: string;
  mimeType?: string;
};

const motionPromoVideo: MotionVideo = {
  src: withBasePath("/assistant-promo.webm"),
  title: "Ассистент преподавателя",
  mimeType: "video/webm",
};

const motionGridVideos: MotionVideo[] = [
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

const motionPlaylist = [motionPromoVideo, ...motionGridVideos];

function getMotionVideoLayout(index: number): "wide" | "square" {
  return index % 3 === 0 ? "wide" : "square";
}

function CaseVideoLightbox({
  video,
  isClosing,
  onClose,
}: {
  video: MotionVideo;
  isClosing: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [onClose]);

  return (
    <div
      className={`case-image-lightbox ${
        isClosing
          ? "case-image-lightbox--closing"
          : "case-image-lightbox--opening"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      onClick={onClose}
    >
      <div
        className="case-image-lightbox__frame"
        onClick={(event) => event.stopPropagation()}
      >
        <CaseMotionVideo
          src={video.src}
          mimeType={video.mimeType}
          mode="lightbox"
          isPlaying={!isClosing}
          className={`case-image-lightbox__image case-image-lightbox__video ${
            isClosing
              ? "case-image-lightbox__image--closing"
              : "case-image-lightbox__image--opening"
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

function MotionVideoTile({
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
      className={`case-zoomable-video bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 ${
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

function CaseMotionGrid({
  videos,
}: {
  videos: ReadonlyArray<MotionVideo>;
}) {
  const [lightboxVideo, setLightboxVideo] = useState<MotionVideo | null>(null);
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
    if (lightboxCloseTimeoutRef.current) {
      window.clearTimeout(lightboxCloseTimeoutRef.current);
      lightboxCloseTimeoutRef.current = null;
    }

    setIsLightboxClosing(false);
    setLightboxVideo(video);
  }

  function closeLightbox() {
    if (!lightboxVideo || isLightboxClosing) {
      return;
    }

    setIsLightboxClosing(true);
    lightboxCloseTimeoutRef.current = window.setTimeout(() => {
      setLightboxVideo(null);
      setIsLightboxClosing(false);
      lightboxCloseTimeoutRef.current = null;
    }, CASE_LIGHTBOX_ANIMATION_MS);
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
      {lightboxVideo
        ? createPortal(
            <CaseVideoLightbox
              video={lightboxVideo}
              isClosing={isLightboxClosing}
              onClose={closeLightbox}
            />,
            document.body,
          )
        : null}
    </>
  );
}

function MotionCase() {
  return (
    <div className="case-content flex min-h-0 w-full flex-1 flex-col overflow-y-auto pr-2 text-[#fafafa]">
      <CaseMotionGrid videos={motionPlaylist} />
    </div>
  );
}

const assistantPromoFrames = [
  {
    src: withBasePath("/cases/assistant-promo/1.avif"),
    alt: "Поле ввода ассистента: «Напишите, с чем вам помочь»",
    width: 1024,
    height: 567,
  },
  {
    src: withBasePath("/cases/assistant-promo/2.avif"),
    alt: "Кадр промо: «Попробуйте»",
    width: 1024,
    height: 567,
  },
  {
    src: withBasePath("/cases/assistant-promo/3.avif"),
    alt: "Кнопка «Создавайте задания» с ИИ-иконкой",
    width: 1024,
    height: 565,
  },
  {
    src: withBasePath("/cases/assistant-promo/4.avif"),
    alt: "Расписание занятий в интерфейсе ассистента",
    width: 1024,
    height: 570,
  },
] as const;

type CaseImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  layout?: "solo";
};

const profileAvatarImage: CaseImage = {
  src: withBasePath("/profile.png"),
  alt: "Родион Плехов",
  width: 640,
  height: 640,
};

type CaseImageGroup =
  | { type: "landscape"; images: CaseImage[] }
  | { type: "portrait"; images: CaseImage[] }
  | { type: "solo"; images: CaseImage[] };

function isPortraitCaseImage(image: CaseImage) {
  return image.height > image.width;
}

function groupCaseImages(
  images: ReadonlyArray<CaseImage>,
): CaseImageGroup[] {
  const groups: CaseImageGroup[] = [];
  let landscapeBatch: CaseImage[] = [];
  let portraitBatch: CaseImage[] = [];

  function flushLandscapeBatch() {
    if (landscapeBatch.length === 0) {
      return;
    }

    groups.push({ type: "landscape", images: landscapeBatch });
    landscapeBatch = [];
  }

  function flushPortraitBatch() {
    if (portraitBatch.length === 0) {
      return;
    }

    groups.push({ type: "portrait", images: portraitBatch });
    portraitBatch = [];
  }

  for (const image of images) {
    if (image.layout === "solo") {
      flushLandscapeBatch();
      flushPortraitBatch();
      groups.push({ type: "solo", images: [image] });
      continue;
    }

    if (isPortraitCaseImage(image)) {
      flushLandscapeBatch();
      portraitBatch.push(image);
      continue;
    }

    flushPortraitBatch();
    landscapeBatch.push(image);
  }

  flushLandscapeBatch();
  flushPortraitBatch();

  return groups;
}

const profileIntroImage = [
  {
    src: withBasePath("/cases/profile/login-desktop.png"),
    alt: "Вход в аккаунт — веб",
    width: 1024,
    height: 767,
  },
] as const satisfies ReadonlyArray<CaseImage>;

const profileSsoImages = [
  {
    src: withBasePath("/cases/profile/redirect-loading.png"),
    alt: "Переход в сервис после входа",
    width: 1024,
    height: 767,
  },
] as const satisfies ReadonlyArray<CaseImage>;

const profileAuthFlowImages = [
  {
    src: withBasePath("/cases/profile/login-desktop.png"),
    alt: "Вход в аккаунт — веб",
    width: 1024,
    height: 767,
  },
  {
    src: withBasePath("/cases/profile/otp-desktop.png"),
    alt: "Ввод кода из СМС — веб",
    width: 1024,
    height: 767,
  },
  {
    src: withBasePath("/cases/profile/login-mobile.png"),
    alt: "Вход в аккаунт — мобильная версия",
    width: 473,
    height: 1024,
  },
  {
    src: withBasePath("/cases/profile/otp-mobile.png"),
    alt: "Ввод кода из СМС — мобильная версия",
    width: 473,
    height: 1024,
  },
  {
    src: withBasePath("/cases/profile/email-confirm-mobile.png"),
    alt: "Подтверждение электронной почты",
    width: 473,
    height: 1024,
  },
] as const satisfies ReadonlyArray<CaseImage>;

const profilePageImage = [
  {
    src: withBasePath("/cases/profile/profile-page.png"),
    alt: "Профиль пользователя: данные, контакты и школа",
    width: 824,
    height: 1024,
    layout: "solo",
  },
] as const satisfies ReadonlyArray<CaseImage>;

const profileScreensImages = [
  {
    src: withBasePath("/cases/profile/account-protection.png"),
    alt: "Защита аккаунта: логин и пароль",
    width: 1024,
    height: 767,
  },
] as const satisfies ReadonlyArray<CaseImage>;

const profileErrorImages = [
  {
    src: withBasePath("/cases/profile/error-login-failed.png"),
    alt: "Ошибка входа в аккаунт",
    width: 1024,
    height: 767,
  },
  {
    src: withBasePath("/cases/profile/error-service-unavailable.png"),
    alt: "Сервис временно недоступен",
    width: 1024,
    height: 767,
  },
] as const satisfies ReadonlyArray<CaseImage>;

const profileGalleryImages: CaseImage[] = [
  ...profileAuthFlowImages,
  ...profilePageImage,
  ...profileScreensImages,
  ...profileErrorImages,
];

const mainPageCoverImage = [
  {
    src: withBasePath("/cases/main/video.png"),
    alt: "Главная страница Лаборатории заданий — hero-блок",
    width: 2048,
    height: 1200,
    layout: "solo",
  },
] as const satisfies ReadonlyArray<CaseImage>;

const mainPageMobileScreens = [
  {
    src: withBasePath("/cases/main/screen-1.png"),
    alt: "Главная страница — мобильная версия, экран 1",
    width: 640,
    height: 1400,
  },
  {
    src: withBasePath("/cases/main/screen-2.png"),
    alt: "Главная страница — мобильная версия, экран 2",
    width: 640,
    height: 1400,
  },
  {
    src: withBasePath("/cases/main/screen-3.png"),
    alt: "Главная страница — мобильная версия, экран 3",
    width: 640,
    height: 1400,
  },
] as const satisfies ReadonlyArray<CaseImage>;

const mainPageDesktopScreens = [
  {
    src: withBasePath("/cases/main/video-1.png"),
    alt: "Блок «Удобно учить, по‑своему учиться»",
    width: 2048,
    height: 1200,
  },
  {
    src: withBasePath("/cases/main/video-4.png"),
    alt: "Блок «Здесь технологии помогают и поддерживают»",
    width: 2048,
    height: 1200,
  },
  {
    src: withBasePath("/cases/main/video-2.png"),
    alt: "Блок «Классные возможности для всех» — педагогу",
    width: 2048,
    height: 1200,
  },
  {
    src: withBasePath("/cases/main/video-3.png"),
    alt: "Блок «Классные возможности для всех» — ученику",
    width: 2048,
    height: 1200,
  },
] as const satisfies ReadonlyArray<CaseImage>;

const statisticIntroImage = [
  {
    src: withBasePath("/cases/statistic/metrics-overview.png"),
    alt: "Страница статистики — динамика метрик",
    width: 3456,
    height: 3184,
  },
] as const satisfies ReadonlyArray<CaseImage>;

const aiIntroImage = [
  {
    src: withBasePath("/cases/ai/home-desktop.png"),
    alt: "Главный экран — веб",
    width: 3456,
    height: 2048,
  },
] as const satisfies ReadonlyArray<CaseImage>;

const aiMobileScreens = [
  {
    src: withBasePath("/cases/ai/home-mobile.png"),
    alt: "Главный экран — мобильная версия",
    width: 720,
    height: 1688,
  },
  {
    src: withBasePath("/cases/ai/compose-mobile.png"),
    alt: "Ввод запроса и выбор сценария",
    width: 720,
    height: 1688,
  },
  {
    src: withBasePath("/cases/ai/history-mobile.png"),
    alt: "История чатов",
    width: 720,
    height: 1688,
  },
] as const satisfies ReadonlyArray<CaseImage>;

const aiDesktopScreens = [
  {
    src: withBasePath("/cases/ai/lesson-planning-desktop.png"),
    alt: "Планирование занятий",
    width: 3456,
    height: 2048,
  },
  {
    src: withBasePath("/cases/ai/chat-desktop.png"),
    alt: "Чат с математической клавиатурой",
    width: 3456,
    height: 2048,
  },
  {
    src: withBasePath("/cases/ai/math-keyboard-spec.png"),
    alt: "Математическая клавиатура — спецификация",
    width: 3476,
    height: 1756,
    layout: "solo",
  },
] as const satisfies ReadonlyArray<CaseImage>;

const statisticScreens = [
  {
    src: withBasePath("/cases/statistic/filters.png"),
    alt: "Фильтры — предмет, класс и период",
    width: 3456,
    height: 2048,
  },
  {
    src: withBasePath("/cases/statistic/statistics-screen.png"),
    alt: "Страница статистики — обзор метрик",
    width: 2712,
    height: 1510,
  },
  {
    src: withBasePath("/cases/statistic/period-comparison.png"),
    alt: "Сравнение показателей за период",
    width: 3456,
    height: 2048,
  },
  {
    src: withBasePath("/cases/statistic/conversation-distribution.png"),
    alt: "Распределение разговора на уроке",
    width: 3456,
    height: 2048,
  },
  {
    src: withBasePath("/cases/statistic/emotional-modality.png"),
    alt: "Эмоциональная модальность",
    width: 3456,
    height: 2048,
  },
  {
    src: withBasePath("/cases/statistic/empty-state.png"),
    alt: "Пустое состояние — нет данных за период",
    width: 3456,
    height: 2048,
  },
] as const satisfies ReadonlyArray<CaseImage>;

const homeIntroImage = [
  {
    src: withBasePath("/cases/main/video.png"),
    alt: "Главная страница Лаборатории заданий — hero-блок",
    width: 2048,
    height: 1200,
  },
] as const satisfies ReadonlyArray<CaseImage>;

const subscriptionIntroImage = [
  {
    src: withBasePath("/cases/subscribe/Тарифы.png"),
    alt: "Страница тарифов — сравнение планов",
    width: 3456,
    height: 2004,
    layout: "solo",
  },
] as const satisfies ReadonlyArray<CaseImage>;

const subscriptionTariffScreens = [
  {
    src: withBasePath("/cases/subscribe/Страница тарифаов.png"),
    alt: "Страница тарифов — обновлённая линейка",
    width: 3456,
    height: 2976,
    layout: "solo",
  },
  {
    src: withBasePath("/cases/subscribe/Безлимитный.png"),
    alt: "Новый тариф «Безлимитный»",
    width: 3456,
    height: 2048,
  },
] as const satisfies ReadonlyArray<CaseImage>;

const subscriptionManagementScreens = [
  {
    src: withBasePath("/cases/subscribe/Банковские карты.png"),
    alt: "Управление подпиской — способы оплаты",
    width: 3456,
    height: 2048,
  },
  {
    src: withBasePath("/cases/subscribe/Платёжка.png"),
    alt: "Оформление подписки — платёжная форма",
    width: 3456,
    height: 2048,
  },
] as const satisfies ReadonlyArray<CaseImage>;

const subscriptionPaymentScreens = [
  {
    src: withBasePath("/cases/subscribe/Оплачено.png"),
    alt: "Успешная оплата подписки",
    width: 3456,
    height: 2048,
  },
  {
    src: withBasePath("/cases/subscribe/Оплата не\u00a0прошла.png"),
    alt: "Ошибка оплаты — понятное сообщение",
    width: 3456,
    height: 2048,
  },
  {
    src: withBasePath("/cases/subscribe/Письмо.png"),
    alt: "Письмо об автосписании и условиях подписки",
    width: 3456,
    height: 2250,
    layout: "solo",
  },
] as const satisfies ReadonlyArray<CaseImage>;

const vkCartIntroImage = [
  {
    src: withBasePath("/cases/cart/cover.png"),
    alt: "Редизайн корзины VK Маркет — обложка кейса",
    width: 1920,
    height: 1080,
    layout: "solo",
  },
] as const satisfies ReadonlyArray<CaseImage>;

const vkCartScreens = [
  {
    src: withBasePath("/cases/cart/003.png"),
    alt: "Корзина VK Маркет — экран 1",
    width: 2880,
    height: 2744,
  },
  {
    src: withBasePath("/cases/cart/004.png"),
    alt: "Корзина VK Маркет — экран 2",
    width: 2880,
    height: 2524,
  },
  {
    src: withBasePath("/cases/cart/005.png"),
    alt: "Корзина VK Маркет — экран 3",
    width: 2880,
    height: 4428,
    layout: "solo",
  },
] as const satisfies ReadonlyArray<CaseImage>;

function CaseFigmaPrototype({
  title,
  prototypeUrl,
}: {
  title: string;
  prototypeUrl: string;
}) {
  const embedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(prototypeUrl)}`;

  return (
    <section className="case-section mx-auto flex w-full flex-col gap-4">
      <h3>{title}</h3>
      <div className="case-figma-embed overflow-hidden rounded-2xl border border-white/12 bg-white/6">
        <iframe
          title={title}
          src={embedUrl}
          className="case-figma-embed__frame"
          allowFullScreen
        />
      </div>
      <a
        href={prototypeUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-fit items-center gap-1.5 rounded-sm text-base font-semibold leading-6 tracking-[-0.2px] text-white/86 underline decoration-white/35 underline-offset-2 transition hover:text-white hover:decoration-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
      >
        Открыть прототип в Figma
      </a>
    </section>
  );
}

function useCaseImageLightbox() {
  const [lightboxImage, setLightboxImage] = useState<CaseImage | null>(null);
  const [isLightboxClosing, setIsLightboxClosing] = useState(false);
  const lightboxCloseTimeoutRef = useRef<number | null>(null);
  const lightboxImageRef = useRef<CaseImage | null>(null);
  const isLightboxClosingRef = useRef(false);

  lightboxImageRef.current = lightboxImage;
  isLightboxClosingRef.current = isLightboxClosing;

  useEffect(() => {
    return () => {
      if (lightboxCloseTimeoutRef.current) {
        window.clearTimeout(lightboxCloseTimeoutRef.current);
      }
    };
  }, []);

  const openLightbox = useCallback((image: CaseImage) => {
    if (lightboxCloseTimeoutRef.current) {
      window.clearTimeout(lightboxCloseTimeoutRef.current);
      lightboxCloseTimeoutRef.current = null;
    }

    setIsLightboxClosing(false);
    setLightboxImage(image);
  }, []);

  const closeLightbox = useCallback(() => {
    if (!lightboxImageRef.current || isLightboxClosingRef.current) {
      return;
    }

    setIsLightboxClosing(true);
    lightboxCloseTimeoutRef.current = window.setTimeout(() => {
      setLightboxImage(null);
      setIsLightboxClosing(false);
      lightboxCloseTimeoutRef.current = null;
    }, CASE_LIGHTBOX_ANIMATION_MS);
  }, []);

  const lightboxPortal: ReactPortal | null = lightboxImage
    ? createPortal(
        <CaseImageLightbox
          image={lightboxImage}
          isClosing={isLightboxClosing}
          onClose={closeLightbox}
        />,
        document.body,
      )
    : null;

  return { openLightbox, lightboxPortal };
}

function CaseImageLightbox({
  image,
  isClosing,
  onClose,
}: {
  image: CaseImage;
  isClosing: boolean;
  onClose: () => void;
}) {
  const { isReady, markReady } = useMediaReady(image.src);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [onClose]);

  return (
    <div
      className={`case-image-lightbox ${
        isClosing
          ? "case-image-lightbox--closing"
          : "case-image-lightbox--opening"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      onClick={onClose}
    >
      <div className="case-image-lightbox__frame">
        {!isReady ? (
          <MediaSkeleton
            className="pointer-events-none absolute left-1/2 top-1/2 max-h-[88dvh] w-[min(92dvw,960px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl"
            style={{ aspectRatio: `${image.width} / ${image.height}` }}
          />
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className={`case-image-lightbox__image ${
            isReady ? "media-loaded" : "media-loading"
          } ${
            isClosing
              ? "case-image-lightbox__image--closing"
              : "case-image-lightbox__image--opening"
          }`}
          onLoad={markReady}
          onError={markReady}
          onClick={(event) => event.stopPropagation()}
        />
      </div>
      <button
        type="button"
        aria-label="Закрыть просмотр изображения"
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

function CaseGridImage({
  image,
  onOpen,
  appearDelay = 0,
}: {
  image: CaseImage;
  onOpen: (image: CaseImage) => void;
  appearDelay?: number;
}) {
  const { isReady, markReady } = useMediaReady(image.src);

  return (
    <button
      type="button"
      className="case-zoomable-image relative overflow-hidden rounded-2xl bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
      style={{
        aspectRatio: `${image.width} / ${image.height}`,
        "--image-appear-delay": `${appearDelay}ms`,
      } as CSSProperties}
      onClick={() => onOpen(image)}
      aria-label={`Открыть на весь экран: ${image.alt}`}
    >
      {!isReady ? (
        <MediaSkeleton className="absolute inset-0 rounded-[inherit]" />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        decoding="async"
        loading="lazy"
        className={isReady ? "media-loaded" : "media-loading"}
        onLoad={markReady}
        onError={markReady}
      />
    </button>
  );
}

function CaseImageGrid({ images }: { images: ReadonlyArray<CaseImage> }) {
  const { openLightbox, lightboxPortal } = useCaseImageLightbox();
  const groups = groupCaseImages(images);

  return (
    <>
      <div className="case-image-grid mx-auto flex w-full flex-col">
        {groups.map((group, groupIndex) => (
          <div
            key={`${group.type}-${groupIndex}`}
            className={
              group.type === "portrait"
                ? "case-image-grid__portrait"
                : "case-image-grid__landscape"
            }
          >
            {group.images.map((image, imageIndex) => (
              <CaseGridImage
                key={image.src}
                image={image}
                appearDelay={(groupIndex * 3 + imageIndex) * 45}
                onOpen={openLightbox}
              />
            ))}
          </div>
        ))}
      </div>
      {lightboxPortal}
    </>
  );
}

function CaseSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="case-section mx-auto flex w-full flex-col gap-4">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

const aboutMeContactButtonClassName =
  "inline-flex items-center justify-center rounded-full bg-white/10 px-5 py-2.5 text-base font-semibold leading-6 tracking-[-0.2px] text-[#fafafa] transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

function AboutMeContacts() {
  return (
    <nav
      aria-label="Контакты и портфолио"
      className="case-section mx-auto flex w-full flex-wrap items-center gap-3"
    >
      <a
        href="https://t.me/r_plekhov"
        target="_blank"
        rel="noreferrer"
        className={aboutMeContactButtonClassName}
      >
        Telegram
      </a>
      <a
        href="mailto:r_plekhov@icloud.com"
        className={aboutMeContactButtonClassName}
      >
        Почта
      </a>
      <a
        href="https://vk.com/plekhovrodion"
        target="_blank"
        rel="noreferrer"
        className={aboutMeContactButtonClassName}
      >
        ВК
      </a>
      <a
        href="https://www.behance.net/plekhovrodion"
        target="_blank"
        rel="noreferrer"
        className={aboutMeContactButtonClassName}
      >
        Behance
      </a>
    </nav>
  );
}

function ProfileAvatar({
  size = "sm",
  priority = false,
}: {
  size?: "sm" | "md";
  priority?: boolean;
}) {
  const { openLightbox, lightboxPortal } = useCaseImageLightbox();
  const { isReady, markReady } = useMediaReady(profileAvatarImage.src);
  const sizeClass =
    size === "sm" ? "size-14 min-[901px]:size-16" : "size-20";
  const imageSizes = size === "sm" ? "(max-width: 900px) 56px, 64px" : "80px";

  return (
    <>
      <button
        type="button"
        className={`relative ${sizeClass} shrink-0 cursor-zoom-in overflow-hidden rounded-full bg-white transition hover:ring-2 hover:ring-white/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70`}
        onClick={() => openLightbox(profileAvatarImage)}
        onPointerDown={(event) => event.stopPropagation()}
        aria-label="Открыть фото на весь экран"
      >
        {!isReady ? (
          <MediaSkeleton className="absolute inset-0 rounded-full" />
        ) : null}
        <Image
          src={profileAvatarImage.src}
          alt={profileAvatarImage.alt}
          fill
          priority={priority}
          sizes={imageSizes}
          className={`object-cover ${isReady ? "media-loaded" : "media-loading"}`}
          onLoad={markReady}
        />
      </button>
      {lightboxPortal}
    </>
  );
}

function AboutMeCase() {
  return (
    <div className="case-content flex min-h-0 w-full flex-1 flex-col gap-10 overflow-y-auto pr-2 text-[#fafafa]">
      <section className="case-section mx-auto flex w-full flex-col gap-4">
        <ProfileAvatar size="md" />
        <h1>Родион Плехов</h1>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Продуктовый дизайнер в{" "}
          <a
            href="https://sbereducation.ru/"
            target="_blank"
            rel="noreferrer"
            className={inlineLinkClassName}
            onPointerDown={(event) => event.stopPropagation()}
          >
            СберОбразовании
          </a>{" "}
          Более 4 лет разрабатываю B2C и B2B системы, сервисы и приложения
        </p>
      </section>

      <AboutMeContacts />

      <CaseSection title="Достижения">
        <div className="flex flex-col gap-6">
          <div>
            <p className="case-description text-base font-semibold leading-6 tracking-[-0.2px] text-white/92">
              Достижения продуктов:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
              {aboutMeProductHighlights.map((item) => (
                <li key={item.title}>
                  <span className="font-semibold">
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className={inlineLinkClassName}
                        onPointerDown={(event) => event.stopPropagation()}
                      >
                        {item.title}:
                      </a>
                    ) : (
                      `${item.title}:`
                    )}
                  </span>{" "}
                  {item.description}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="case-description text-base font-semibold leading-6 tracking-[-0.2px] text-white/92">
              Достижения в команде:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
              {aboutMeTeamHighlights.map((item) => (
                <li key={item.title}>
                  <span className="font-semibold">{item.title}:</span>{" "}
                  {item.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CaseSection>

      <CaseSection title="Опыт работы">
        <ul className="space-y-4 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>
            <p className="font-semibold text-white/92">
              <a
                href="https://sbereducation.ru/"
                target="_blank"
                rel="noreferrer"
                className={inlineLinkClassName}
                onPointerDown={(event) => event.stopPropagation()}
              >
                СберОбразование
              </a>
            </p>
            <p>Продуктовый дизайнер · Июль 2023 — сейчас (2 года и 11 месяцев)</p>
          </li>
          <li>
            <p className="font-semibold text-white/92">AINSYS</p>
            <p>Продуктовый дизайнер · 2 года и 3 месяца</p>
          </li>
          <li>
            <p className="font-semibold text-white/92">
              <a
                href="https://gpbl.ru/"
                target="_blank"
                rel="noreferrer"
                className={inlineLinkClassName}
                onPointerDown={(event) => event.stopPropagation()}
              >
                Газпромбанк Лизинг, ЗАО
              </a>
            </p>
            <p>Графический дизайнер · Июнь 2021 — Июнь 2023 (2 года и 1 месяц)</p>
          </li>
          <li>
            <p className="font-semibold text-white/92">
              <a
                href="https://m1casino.ru/"
                target="_blank"
                rel="noreferrer"
                className={inlineLinkClassName}
                onPointerDown={(event) => event.stopPropagation()}
              >
                Казино М1
              </a>
            </p>
            <p>Графический дизайнер · Март 2021 — Май 2022 (1 год и 3 месяца)</p>
          </li>
        </ul>
      </CaseSection>
    </div>
  );
}

function UnifiedProfileCase() {
  return (
    <div className="case-content flex min-h-0 w-full flex-1 flex-col gap-10 overflow-y-auto pr-2 text-[#fafafa]">
      <CaseImageGrid images={profileIntroImage} />

      <section className="case-section mx-auto flex w-full flex-col gap-4">
        <h1>
          <a
            href="https://app.edu-assist.me/profile"
            target="_blank"
            rel="noreferrer"
            className={inlineLinkClassName}
            onPointerDown={(event) => event.stopPropagation()}
          >
            Единый профиль для сервисов СберОбразования
          </a>
        </h1>
        <h2>Контекст</h2>
        <p className="case-lead text-xl font-semibold leading-7 tracking-[-0.6px] text-white/86">
          У{" "}
          <a
            href="https://sbereducation.ru/"
            target="_blank"
            rel="noreferrer"
            className={inlineLinkClassName}
            onPointerDown={(event) => event.stopPropagation()}
          >
            СберОбразования
          </a>{" "}
          было четыре независимых продукта, каждый со своим:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>входом и регистрацией</li>
          <li>админкой</li>
          <li>базой пользователей</li>
          <li>логикой авторизации</li>
        </ul>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Команда тратила много времени на поддержку четырёх разных систем, а
          пользователи путались и теряли доступ
        </p>
      </section>

      <CaseSection title="Цель проекта">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Создать единый аккаунт для всех сервисов, чтобы:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>упростить вход и регистрацию</li>
          <li>снизить нагрузку на поддержку</li>
          <li>повысить конверсию в регистрацию</li>
          <li>обеспечить единый профиль пользователя</li>
        </ul>
      </CaseSection>

      <CaseSection title="Критерии успеха">
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>снижение обращений в поддержку по входу</li>
          <li>рост регистраций</li>
          <li>подключение остальных продуктов к единому аккаунту</li>
          <li>сокращение времени на поддержку</li>
        </ul>
      </CaseSection>

      <CaseSection title="Моя роль">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Я работал как продуктовый дизайнер и отвечал за полный цикл:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>формирование понимания задачи</li>
          <li>дискавери и исследование</li>
          <li>формирование и приоритизация гипотез</li>
          <li>проектирование UX/UI</li>
          <li>согласование с разработкой</li>
          <li>авторский надзор до релиза</li>
        </ul>
      </CaseSection>

      <CaseImageGrid images={profileSsoImages} />

      <CaseSection title="Исследование">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Провёл анализ четырёх продуктов
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>изучил воронки входа и регистрации</li>
          <li>нашёл точки, где пользователи чаще всего «спотыкаются»</li>
          <li>выявил несоответствия в логике и UI</li>
        </ul>
      </CaseSection>

      <CaseSection title="Анализ аналогов">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Изучил лучшие практики:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>Яндекс ID</li>
          <li>ВК ID</li>
          <li>Госуслуги</li>
          <li>Skyeng</li>
          <li>Фоксфорд</li>
        </ul>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Собрал паттерны по:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>регистрации</li>
          <li>восстановлению доступа</li>
          <li>двухфакторной аутентификации</li>
          <li>управлению профилем</li>
        </ul>
      </CaseSection>

      <CaseSection title="Гипотезы">
        <ol className="list-decimal space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>Единый аккаунт снизит количество обращений в поддержку</li>
          <li>
            Упрощённая регистрация (телефон/email + OTP) повысит конверсию
          </li>
          <li>
            Единый профиль уменьшит количество ошибок при передаче данных между
            сервисами
          </li>
          <li>Двухфакторная аутентификация повысит доверие пользователей</li>
        </ol>
      </CaseSection>

      <CaseSection title="CJM">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Построил путь пользователя от входа до заполнения профиля
        </p>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Нашёл узкие места:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>лишние шаги</li>
          <li>непонятные статусы</li>
          <li>дублирующие поля</li>
          <li>отсутствие единой логики</li>
        </ul>
      </CaseSection>

      <CaseImageGrid images={profileGalleryImages} />

      <CaseSection title="UX-тестирование">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Провели тестирование прототипов на 12 респондентах:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>6 родителей</li>
          <li>6 школьников</li>
        </ul>
        <h4>Что выявили:</h4>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>путаница в шагах регистрации</li>
          <li>непонимание, зачем нужен пароль после OTP</li>
          <li>сложности с подтверждением email</li>
        </ul>
        <h4>Что улучшили:</h4>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>последовательность шагов</li>
          <li>тексты и подсказки</li>
          <li>визуальные статусы</li>
        </ul>
      </CaseSection>

    </div>
  );
}

function HomePageCase() {
  return (
    <div className="case-content flex min-h-0 w-full flex-1 flex-col gap-10 overflow-y-auto pr-2 text-[#fafafa]">
      <CaseImageGrid images={homeIntroImage} />

      <section className="case-section mx-auto flex w-full flex-col gap-4">
        <h1>
          <a
            href="https://edu-assist.ru/"
            target="_blank"
            rel="noreferrer"
            className={inlineLinkClassName}
            onPointerDown={(event) => event.stopPropagation()}
          >
            Главная страница Лаборатории заданий
          </a>
        </h1>
        <h2>Контекст</h2>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Платформа позволяет репетиторам:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>проводить онлайн‑занятия</li>
          <li>создавать и выдавать задания</li>
          <li>проверять работы</li>
          <li>отслеживать прогресс каждого ученика</li>
        </ul>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Главная страница была перегружена, не помогала быстро переходить к
          созданию контента и не стимулировала использование ИИ‑функциональности
        </p>
      </section>

      <CaseSection title="Результаты">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Сравнивались два периода: 12.12–20.12 (до релиза) vs 12.01–20.01
          (после релиза)
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>доля использований ИИ: +72%</li>
          <li>созданных заданий на преподавателя: +45%</li>
          <li>конверсия учителей в ИИ‑чаты: +175%</li>
          <li>конверсия в ИИ‑генерацию заданий: +51%</li>
        </ul>
      </CaseSection>

      <CaseImageGrid images={mainPageCoverImage} />

      <CaseSection title="Задачи продукта">
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>сократить количество кликов до целевого действия</li>
          <li>
            объединить библиотеку и главную страницу в единый рабочий центр
          </li>
          <li>повысить использование ИИ‑функционала</li>
          <li>увеличить количество создаваемых заданий</li>
          <li>улучшить конверсию в выдачу заданий ученикам</li>
        </ul>
      </CaseSection>

      <CaseSection title="Моя роль">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Я отвечал за:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>анализ пользовательских сценариев</li>
          <li>формирование гипотез</li>
          <li>проектирование UX главной страницы</li>
          <li>интеграцию ИИ‑функций в ключевые точки</li>
          <li>согласование с продуктом и разработкой</li>
          <li>авторский надзор после релиза</li>
        </ul>
      </CaseSection>

      <CaseImageGrid images={mainPageMobileScreens} />

      <CaseSection title="Исследование">
        <h4>Что обнаружили:</h4>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>
            пользователи тратят слишком много времени, чтобы добраться до
            создания задания
          </li>
          <li>ИИ‑функции были «спрятаны» и использовались редко</li>
          <li>библиотека и главная дублировали функции</li>
          <li>
            репетиторы часто создают задания, но не всегда доходят до выдачи
            ученикам
          </li>
        </ul>
        <h4>Гипотезы:</h4>
        <ol className="list-decimal space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>
            Если вынести ИИ‑создание контента на первый экран — вырастет
            использование ИИ
          </li>
          <li>
            Если объединить библиотеку и главную — сократится путь до целевого
            действия
          </li>
          <li>
            Если показать недавние материалы и быстрые действия — увеличится
            количество создаваемых заданий
          </li>
        </ol>
      </CaseSection>

      <CaseImageGrid images={mainPageDesktopScreens} />
    </div>
  );
}

function AiAssistantCase() {
  return (
    <div className="case-content flex min-h-0 w-full flex-1 flex-col gap-10 overflow-y-auto pr-2 text-[#fafafa]">
      <CaseImageGrid images={aiIntroImage} />

      <section className="case-section mx-auto flex w-full flex-col gap-4">
        <h1>
          <a
            href="https://app.edu-assist.me/ai"
            target="_blank"
            rel="noreferrer"
            className={inlineLinkClassName}
            onPointerDown={(event) => event.stopPropagation()}
          >
            ИИ-помощник в Лаборатории заданий
          </a>
        </h1>
      </section>

      <CaseSection title="Задача">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Спроектировать ИИ-помощника для ученика и учителя: сценарии,
          ветки диалога и интерфейс чата под разные запросы
        </p>
      </CaseSection>

      <CaseSection title="Результаты">
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>20 600 чатов</li>
          <li>5,9 сообщений на диалог</li>
          <li>~3 минуты в чате</li>
        </ul>
      </CaseSection>

      <CaseImageGrid images={aiMobileScreens} />

      <CaseImageGrid images={aiDesktopScreens} />
    </div>
  );
}

function ClassesStatisticsCase() {
  return (
    <div className="case-content flex min-h-0 w-full flex-1 flex-col gap-10 overflow-y-auto pr-2 text-[#fafafa]">
      <CaseImageGrid images={statisticIntroImage} />

      <section className="case-section mx-auto flex w-full flex-col gap-4">
        <h1>Статистика занятий</h1>
        <h2>Контекст</h2>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <a
            href="https://edu-assist.me/promo"
            target="_blank"
            rel="noreferrer"
            className={inlineLinkClassName}
            onPointerDown={(event) => event.stopPropagation()}
          >
            Ассистент преподавателя
          </a>{" "}
          анализирует уроки и даёт:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>динамику метрик</li>
          <li>рекомендации по улучшению</li>
          <li>распознавание эмоций</li>
          <li>речевую аналитику</li>
        </ul>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Но преподаватели не могли{" "}
          <strong className="font-semibold text-white/92">
            посмотреть, как меняются их показатели со временем
          </strong>
          , и не понимали, улучшается ли их преподавание
        </p>
      </section>

      <CaseSection title="Проблема">
        <blockquote className="case-lead border-l-2 border-white/30 pl-4 text-xl font-semibold leading-7 tracking-[-0.6px] text-white/86">
          Преподаватель не может увидеть, как меняются его метрики и приёмы
          преподавания в динамике
        </blockquote>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Пользователи:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>не понимают, что означает каждая метрика</li>
          <li>путаются в периодах сравнения</li>
          <li>не могут выбрать предмет или параллель</li>
          <li>не могут сравнить уроки между собой</li>
        </ul>
      </CaseSection>

      <CaseSection title="Цель">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Создать функциональность, которая позволит преподавателю{" "}
          <strong className="font-semibold text-white/92">
            анализировать динамику метрик по загруженным урокам
          </strong>
          , понимать прогресс и корректировать методы преподавания
        </p>
      </CaseSection>

      <CaseSection title="JTBD (MVP)">
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>
            <strong className="font-semibold text-white/92">
              Я хочу видеть изменения ключевых метрик
            </strong>
            , чтобы понимать, как мои методы преподавания влияют на процесс
            обучения
          </li>
          <li>
            <strong className="font-semibold text-white/92">
              Я хочу фильтровать предметы и параллели
            </strong>
            , чтобы понимать, где у меня проседают результаты
          </li>
          <li>
            <strong className="font-semibold text-white/92">
              Я хочу выбирать свои периоды анализа
            </strong>
            , чтобы выявлять слабые места и корректировать стиль преподавания
          </li>
        </ul>
      </CaseSection>

      <CaseImageGrid images={statisticScreens} />

      <CaseSection title="UX‑исследование">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Провели интервью и тестирование с преподавателями
        </p>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <strong className="font-semibold text-white/92">Что узнали:</strong>
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>пользователям нравится идея динамики метрик</li>
          <li>им интересно видеть прогресс</li>
          <li>
            но они <strong className="font-semibold text-white/92">путаются в интерпретации показателей</strong>
          </li>
          <li>
            не понимают, что сравнивается: среднее? последний урок? период?
          </li>
          <li>
            хотят сравнивать <strong className="font-semibold text-white/92">последний урок с предыдущим</strong>
          </li>
          <li>
            хотят видеть <strong className="font-semibold text-white/92">только важные метрики</strong>, а не всё
            подряд
          </li>
        </ul>
      </CaseSection>
    </div>
  );
}

function SubscriptionCase() {
  return (
    <div className="case-content flex min-h-0 w-full flex-1 flex-col gap-10 overflow-y-auto pr-2 text-[#fafafa]">
      <CaseImageGrid images={subscriptionIntroImage} />

      <section className="case-section mx-auto flex w-full flex-col gap-4">
        <h1>
          <a
            href="https://edu-assist.ru/"
            target="_blank"
            rel="noreferrer"
            className={inlineLinkClassName}
            onPointerDown={(event) => event.stopPropagation()}
          >
            Тарифы в Лаборатории заданий
          </a>
        </h1>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Чтобы масштабировать продукт и монетизацию, команда решила:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>обновить тарифную линейку</li>
          <li>улучшить UX страницы тарифов</li>
          <li>переработать страницу управления подпиской</li>
          <li>внедрить промокоды</li>
          <li>сделать прозрачные условия автосписаний</li>
          <li>добавить новый тариф «Безлимитный»</li>
        </ul>
      </section>

      <CaseSection title="Цель исследования">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Понять:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>как показывать тарифы понятно и прозрачно</li>
          <li>как ограничивать бесплатный тариф, не ломая UX</li>
          <li>как стимулировать апгрейд</li>
          <li>как уведомлять о лимитах</li>
          <li>как строить страницу управления подпиской</li>
          <li>какие механики используют ИИ‑сервисы и EdTech</li>
        </ul>
      </CaseSection>

      <CaseSection title="Объекты исследования">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Я проанализировал <strong className="font-semibold text-white/92">15+ сервисов</strong>, среди них:
        </p>
        <h4>ИИ‑сервисы</h4>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Syntx, Perplexity, Gemini, ChatGPT, Claude, Lovable
        </p>
        <h4>EdTech</h4>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Arzamas, Fitstars, MyBook, Premier
        </p>
        <h4>Инструменты для работы</h4>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Zoom, Tilda, Kinescope, Jivo, Fyrebox, Анкетолог
        </p>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Каждый сервис анализировался по единым критериям:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>где расположен вход в тарифы</li>
          <li>как показывают текущий тариф</li>
          <li>как ограничивают бесплатный план</li>
          <li>как уведомляют о лимитах</li>
          <li>как предлагают апгрейд</li>
          <li>как работают автосписания</li>
          <li>как устроена страница тарифов</li>
          <li>как устроена страница управления подпиской</li>
        </ul>
      </CaseSection>

      <CaseImageGrid images={subscriptionTariffScreens} />

      <CaseSection title="Ключевые инсайты исследования">
        <h4>Тарифы должны быть доступны из нескольких точек</h4>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Лучшие сервисы дублируют вход в тарифы:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>верхнее меню</li>
          <li>личный кабинет</li>
          <li>футер</li>
          <li>уведомления о лимитах</li>
        </ul>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Это снижает фрустрацию и повышает конверсию
        </p>

        <h4>Ограничения бесплатного тарифа должны быть видимыми</h4>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Паттерны:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>красные плашки (Tilda, Jivo)</li>
          <li>баннеры внизу экрана</li>
          <li>всплывающие уведомления при превышении лимита</li>
        </ul>

        <h4>Апгрейд — максимально простой</h4>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>1–2 клика</li>
          <li>подсветка рекомендуемого тарифа</li>
          <li>сравнение тарифов на одном экране</li>
        </ul>

        <h4>Даунгрейд — всегда со следующего периода</h4>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Стандарт индустрии:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>апгрейд — сразу</li>
          <li>даунгрейд — с нового биллингового месяца</li>
        </ul>

        <h4>Страница управления подпиской должна отвечать на 3 вопроса</h4>
        <ol className="list-decimal space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>Какой тариф сейчас?</li>
          <li>До какого числа он действует?</li>
          <li>Что я могу сделать дальше?</li>
        </ol>
      </CaseSection>

      <CaseImageGrid images={subscriptionManagementScreens} />

      <CaseImageGrid images={subscriptionPaymentScreens} />
    </div>
  );
}

function VkCartCase() {
  return (
    <div className="case-content flex min-h-0 w-full flex-1 flex-col gap-10 overflow-y-auto pr-2 text-[#fafafa]">
      <CaseImageGrid images={vkCartIntroImage} />

      <section className="case-section mx-auto flex w-full flex-col gap-4">
        <h1>
          <a
            href="https://vk.com/market"
            target="_blank"
            rel="noreferrer"
            className={inlineLinkClassName}
            onPointerDown={(event) => event.stopPropagation()}
          >
            Корзина ВК Маркет
          </a>
          <span className="text-white/72"> — тестовое задание</span>
        </h1>
      </section>

      <CaseSection title="Задача">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Сделать редизайн страницы корзины приложения{" "}
          <a
            href="https://vk.com/market"
            target="_blank"
            rel="noreferrer"
            className={inlineLinkClassName}
            onPointerDown={(event) => event.stopPropagation()}
          >
            VK Маркет
          </a>
        </p>
      </CaseSection>

      <CaseSection title="Личные цели">
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>Выполнить задачу за максимально короткий срок — 16 часов</li>
          <li>
            Использовать библиотеку VKUI, позволяющую максимально эффективно
            сэкономить время
          </li>
          <li>Объяснять каждый шаг — почему так было сделано</li>
        </ul>
      </CaseSection>

      <CaseSection title="Исследование">
        <h4>Анализ конкурентов и наблюдение</h4>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          По модели КАНО выделил основные атрибуты корзины конкурентов и
          структурировал информацию
        </p>

        <h4>Интервью</h4>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Провёл три глубинных интервью с пользователями маркетплейсов В
          выборке были как те, кто пользовался Маркетом, так и нет
        </p>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <strong className="font-semibold text-white/92">
            Некоторые вопросы респондентам:
          </strong>
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>
            Что вам нравится и не нравится больше всего при оформлении покупки?
          </li>
          <li>
            Попробуйте вспомнить последний раз, когда процесс оформления покупки
            по какой-то причине не мог быть завершён Что вы чувствовали в этот
            момент?
          </li>
          <li>
            Что нужно поменять, добавить или убрать, чтобы вам было удобнее
            оформлять заказ?
          </li>
          <li>
            Какие элементы корзины были самыми важными? А какие — наименее
            важными?
          </li>
        </ul>
      </CaseSection>

      <CaseSection title="Выводы из исследования / Гипотезы">
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>
            Большинство респондентов активно пользуются закладками / избранным
          </li>
          <li>
            Самыми важными критериями являются: цена, отзывы, количество
            заказов
          </li>
          <li>
            Чаще всего респонденты ждут, что им предложат альтернативные товары
            выбранным или дополнительные товары
          </li>
          <li>
            Критерии, на которые респонденты обращают внимание при покупке:
            цена, чёткие фотографии, возможность выбора доставки
          </li>
        </ul>
      </CaseSection>

      <CaseImageGrid images={vkCartScreens} />

      <CaseFigmaPrototype
        title="Прототип в Figma"
        prototypeUrl={vkCartFigmaPrototype}
      />
    </div>
  );
}

function AssistantPromoCase() {
  return (
    <div className="case-content flex min-h-0 w-full flex-1 flex-col gap-10 overflow-y-auto text-[#fafafa]">
      <CaseVideo
        src={withBasePath("/assistant-promo.webm")}
        title="Промо Ассистента преподавателя"
        mimeType="video/webm"
      />

      <CaseSection title="Задача">
        <p className="case-description case-body text-base font-normal leading-6 tracking-[-0.2px]">
          В кратчайшие сроки сделать промо Ассистента преподавателя на конференцию{" "}
          <a
            href="https://cipr.ru/"
            target="_blank"
            rel="noreferrer"
            className="rounded-sm underline decoration-white/35 underline-offset-2 transition hover:text-white/80 hover:decoration-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
          >
            ЦИПР
          </a>
          , сделал за 3 дня, увидели более 3000 человек
        </p>
      </CaseSection>

      <CaseSection title="Кадры">
        <CaseImageGrid images={assistantPromoFrames} />
      </CaseSection>
    </div>
  );
}

function CasePlaceholder({ title }: { title: string }) {
  return (
    <>
      <div className="case-section flex w-full flex-col items-start gap-2 self-center text-[#fafafa]">
        <h1>{title}</h1>
        <h2>Кейс скоро появится</h2>
        <p className="case-lead text-xl font-semibold leading-6 tracking-[-0.6px]">
          Описание и фотографии
        </p>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px]">
          Здесь будет подробное описание проекта, задачи, решения и результата
          Фотографии и материалы можно будет добавить позже
        </p>
      </div>

      <div className="min-h-[280px] flex-1 rounded-2xl bg-white" />
    </>
  );
}

function CaseWindow({
  caseId,
  title,
  position,
  stageSize,
  isDragging,
  isClosing,
  isMaximized,
  onClose,
  onMinimize,
  onToggleMaximize,
  onDragStart,
}: {
  caseId: string;
  title: string;
  position: Position;
  stageSize: StageSize;
  isDragging: boolean;
  isClosing: boolean;
  isMaximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onDragStart: (
    event: ReactPointerEvent<HTMLElement>,
    target: DragTarget,
    position: Position,
    elementSize?: StageSize,
  ) => void;
}) {
  const windowSize = {
    width: isMaximized
      ? stageSize.width
      : Math.min(CASE_WINDOW_WIDTH, stageSize.width),
    height: isMaximized
      ? Math.max(240, stageSize.height - HEADER_HEIGHT)
      : Math.min(CASE_WINDOW_HEIGHT, stageSize.height - HEADER_HEIGHT),
  };

  return (
    <article
      className={`case-window absolute z-30 flex flex-col gap-8 overflow-hidden rounded-[32px] bg-black/50 shadow-[0_16px_48px_rgba(0,0,0,0.24)] backdrop-blur-2xl ${
        isClosing ? "case-window--closing" : ""
      }`}
      style={
        {
          left: isMaximized ? 0 : position.x,
          top: isMaximized ? HEADER_HEIGHT : position.y,
          width: windowSize.width,
          height: windowSize.height,
          "--appear-delay": "0ms",
        } as CSSProperties
      }
    >
      <header
        className={`flex touch-none select-none items-center gap-6 ${
          isMaximized
            ? "cursor-default"
            : isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
        }`}
        onPointerDown={(event) => {
          if (!isMaximized) {
            onDragStart(
              event,
              { type: "case-window" },
              position,
              windowSize,
            );
          }
        }}
      >
        <div className="flex shrink-0 items-center gap-1.5 pl-3">
          <button
            type="button"
            aria-label="Закрыть окно"
            className="window-control-dot size-3.5 rounded-full bg-[#ff5c5f]"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onClose}
          />
          <button
            type="button"
            aria-label="Скрыть окно"
            className="window-control-dot size-3.5 rounded-full bg-[#fac800]"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onMinimize}
          />
          <button
            type="button"
            aria-label={isMaximized ? "Уменьшить окно" : "Увеличить окно"}
            className="window-control-dot size-3.5 rounded-full bg-[#34c759]"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onToggleMaximize}
          />
        </div>
        <p className="min-w-0 flex-1 truncate text-base font-semibold leading-6 tracking-[-0.2px] text-[#fafafa]">
          {title}
        </p>
      </header>

      {caseId === "about-me" ? (
        <AboutMeCase />
      ) : caseId === "home" ? (
        <HomePageCase />
      ) : caseId === "profile" ? (
        <UnifiedProfileCase />
      ) : caseId === "assistant-promo" ? (
        <AssistantPromoCase />
      ) : caseId === "motion" ? (
        <MotionCase />
      ) : caseId === "classes" ? (
        <ClassesStatisticsCase />
      ) : caseId === "ai-assistant" ? (
        <AiAssistantCase />
      ) : caseId === "subscription" ? (
        <SubscriptionCase />
      ) : caseId === "vk-cart" ? (
        <VkCartCase />
      ) : (
        <CasePlaceholder title={title} />
      )}
    </article>
  );
}

export default function Home() {
  const stageRef = useRef<HTMLElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const musicVideoRef = useRef<HTMLVideoElement>(null);
  const dragMovedRef = useRef(false);
  const dragStateRef = useRef<DragState | null>(null);
  const closeWindowTimeoutRef = useRef<number | null>(null);
  const [files, setFiles] = useState(desktopFiles);
  const [stageSize, setStageSize] = useState<StageSize>({
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
  });
  const stageSizeRef = useRef<StageSize>(stageSize);
  const [cardPosition, setCardPosition] = useState<Position>({
    x: 560,
    y: 352,
  });
  const [caseWindowPosition, setCaseWindowPosition] = useState<Position>({
    x: 44,
    y: 68,
  });
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [isCaseWindowClosing, setIsCaseWindowClosing] = useState(false);
  const [isCaseWindowMaximized, setIsCaseWindowMaximized] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [currentTime, setCurrentTime] = useState("--:--");
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    stageSizeRef.current = stageSize;
  }, [stageSize]);

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) {
      return;
    }

    const updateStageSize = () => {
      const rect = stage.getBoundingClientRect();
      const nextStageSize = {
        width: rect.width,
        height: rect.height,
      };

      setStageSize(nextStageSize);

      if (nextStageSize.width <= MOBILE_LAYOUT_BREAKPOINT) {
        setFiles(
          desktopFiles.map((file, index) => ({
            ...file,
            ...getMobileFilePosition(index, nextStageSize),
          })),
        );
        setCardPosition(getMobileCardPosition(nextStageSize));
        setCaseWindowPosition({
          x: 0,
          y: HEADER_HEIGHT,
        });
        return;
      }

      const desktopCardPosition = getDesktopCardPosition(nextStageSize);
      setCardPosition(desktopCardPosition);
      setFiles(
        getDesktopFileOrbitPositions(
          desktopFiles,
          nextStageSize,
          desktopCardPosition,
        ),
      );
    };

    const animationFrameId = window.requestAnimationFrame(updateStageSize);

    const resizeObserver = new ResizeObserver(updateStageSize);
    resizeObserver.observe(stage);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    function handleWindowPointerMove(event: globalThis.PointerEvent) {
      if (!dragStateRef.current) {
        return;
      }

      event.preventDefault();
      moveDrag(event.clientX, event.clientY);
    }

    function handleWindowPointerEnd() {
      stopDrag();
    }

    window.addEventListener("pointermove", handleWindowPointerMove, {
      passive: false,
    });
    window.addEventListener("pointerup", handleWindowPointerEnd);
    window.addEventListener("pointercancel", handleWindowPointerEnd);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerEnd);
      window.removeEventListener("pointercancel", handleWindowPointerEnd);
    };
  });

  useEffect(() => {
    return () => {
      if (closeWindowTimeoutRef.current) {
        window.clearTimeout(closeWindowTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCurrentTime(formatCurrentTime());
    }, 0);
    const intervalId = window.setInterval(() => {
      setCurrentTime(formatCurrentTime());
    }, 10_000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    void backgroundVideoRef.current?.play().catch(() => {
      // Mobile browsers can still block autoplay in low-power modes.
    });
  }, []);

  function getStagePoint(clientX: number, clientY: number) {
    const stage = stageRef.current;

    if (!stage) {
      return { x: 0, y: 0 };
    }

    const rect = stage.getBoundingClientRect();

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function startDrag(
    event: ReactPointerEvent<HTMLElement>,
    target: DragTarget,
    position: Position,
    elementSize?: StageSize,
  ) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const point = getStagePoint(event.clientX, event.clientY);
    const rect = event.currentTarget.getBoundingClientRect();
    const nextDragState = {
      target,
      offsetX: point.x - position.x,
      offsetY: point.y - position.y,
      startX: point.x,
      startY: point.y,
      width: elementSize?.width ?? rect.width,
      height: elementSize?.height ?? rect.height,
      hasMoved: false,
    };

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragMovedRef.current = false;
    dragStateRef.current = nextDragState;
    setDragState(nextDragState);
  }

  function moveDrag(clientX: number, clientY: number) {
    const currentDragState = dragStateRef.current;

    if (!currentDragState) {
      return;
    }

    const point = getStagePoint(clientX, clientY);
    const hasMoved =
      currentDragState.hasMoved ||
      Math.hypot(
        point.x - currentDragState.startX,
        point.y - currentDragState.startY,
      ) > 4;
    dragMovedRef.current = hasMoved;
    const currentStageSize = stageSizeRef.current;
    const nextPosition = {
      x: clamp(
        point.x - currentDragState.offsetX,
        0,
        Math.max(0, currentStageSize.width - currentDragState.width),
      ),
      y: clamp(
        point.y - currentDragState.offsetY,
        HEADER_HEIGHT,
        Math.max(HEADER_HEIGHT, currentStageSize.height - currentDragState.height),
      ),
    };
    const nextDragState = { ...currentDragState, hasMoved };

    dragStateRef.current = nextDragState;
    setDragState(nextDragState);

    if (currentDragState.target.type === "file") {
      const draggedFileId = currentDragState.target.id;

      setFiles((currentFiles) =>
        currentFiles.map((file) =>
          file.id === draggedFileId ? { ...file, ...nextPosition } : file,
        ),
      );
      return;
    }

    if (currentDragState.target.type === "case-window") {
      setCaseWindowPosition(nextPosition);
      return;
    }

    setCardPosition(nextPosition);
  }

  function handleStagePointerMove(event: ReactPointerEvent<HTMLElement>) {
    moveDrag(event.clientX, event.clientY);
  }

  function stopDrag() {
    const currentDragState = dragStateRef.current;
    const shouldOpenTarget = !dragMovedRef.current ? currentDragState : null;

    if (shouldOpenTarget) {
      if (
        shouldOpenTarget.target.type === "file" &&
        activeCaseId !== shouldOpenTarget.target.id
      ) {
        const caseId = shouldOpenTarget.target.id;
        // Defer until after the synthesized click so mobile taps do not
        // hit controls rendered inside the newly opened case window.
        window.setTimeout(() => {
          showCaseWindow(caseId);
        }, 0);
      }

      if (shouldOpenTarget.target.type === "card") {
        window.setTimeout(() => {
          showCaseWindow("about-me");
        }, 0);
      }
    }

    dragMovedRef.current = false;
    dragStateRef.current = null;
    setDragState(null);
  }

  function showCaseWindow(caseId: string) {
    if (closeWindowTimeoutRef.current) {
      window.clearTimeout(closeWindowTimeoutRef.current);
      closeWindowTimeoutRef.current = null;
    }

    const currentStageSize = stageSizeRef.current;
    const isMobile = currentStageSize.width <= MOBILE_LAYOUT_BREAKPOINT;

    setIsCaseWindowClosing(false);
    setIsCaseWindowMaximized(isMobile);
    setCaseWindowPosition(
      getCaseWindowPositionForCase(caseId, currentStageSize, files, cardPosition),
    );
    setActiveCaseId(caseId);
  }

  const hideCaseWindow = useCallback(() => {
    if (!activeCaseId || isCaseWindowClosing) {
      return;
    }

    setIsCaseWindowClosing(true);
    closeWindowTimeoutRef.current = window.setTimeout(() => {
      setActiveCaseId(null);
      setIsCaseWindowClosing(false);
      setIsCaseWindowMaximized(false);
      closeWindowTimeoutRef.current = null;
    }, CASE_WINDOW_ANIMATION_MS);
  }, [activeCaseId, isCaseWindowClosing]);

  useEffect(() => {
    if (!activeCaseId) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (document.querySelector(".case-image-lightbox")) {
        return;
      }

      hideCaseWindow();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeCaseId, hideCaseWindow]);

  function getCaseWindowTitle(caseId: string) {
    return (
      caseWindowTitles[caseId] ??
      desktopFiles.find((file) => file.id === caseId)?.label ??
      "Кейс"
    );
  }

  function toggleMusicMode() {
    const musicVideo = musicVideoRef.current;

    if (isMusicPlaying) {
      setIsMusicPlaying(false);

      if (musicVideo) {
        musicVideo.pause();
        musicVideo.currentTime = 0;
        musicVideo.muted = true;
      }

      return;
    }

    setIsMusicPlaying(true);

    if (musicVideo) {
      musicVideo.muted = false;
      void musicVideo.play().catch(() => {
        musicVideo.muted = true;
        setIsMusicPlaying(false);
      });
    }
  }

  return (
    <main className="portfolio-main relative grid h-svh w-screen place-items-center bg-black text-[#fafafa]">
      <video
        ref={backgroundVideoRef}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          isMusicPlaying ? "opacity-0" : "opacity-100"
        }`}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onCanPlay={(event) => {
          void event.currentTarget.play().catch(() => {
            // Keep the static black fallback if the browser blocks autoplay.
          });
        }}
      >
        <source
          src={withBasePath("/wall.webm")}
          type="video/webm"
        />
      </video>
      <video
        ref={musicVideoRef}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          isMusicPlaying ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        loop
        muted={!isMusicPlaying}
        playsInline
        preload="auto"
      >
        <source src={MUSIC_BACKGROUND_VIDEO} type="video/webm" />
      </video>
      <div className="absolute inset-0 bg-black/35" />

      <section
        ref={stageRef}
        aria-label="Портфолио Родиона Плехова"
        className="figma-stage relative h-full w-full shrink-0 overflow-hidden"
        onPointerMove={handleStagePointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        <header className="desktop-header desktop-label absolute inset-x-0 top-0 flex items-center justify-between text-center text-base font-semibold leading-5 tracking-[-0.2px]">
          <Link
            href="/"
            className="rounded-md transition hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
          >
            Родион Плехов
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="https://t.me/r_plekhov"
              target="_blank"
              rel="noreferrer"
              className="rounded-md transition hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
            >
              @r_plekhov
            </a>
            <button
              type="button"
              aria-label={
                isMusicPlaying ? "Остановить музыку" : "Включить музыку"
              }
              aria-pressed={isMusicPlaying}
              className={`music-toggle grid size-8 place-items-center rounded-full text-white/90 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70 ${
                isMusicPlaying ? "music-toggle--active" : ""
              }`}
              onClick={toggleMusicMode}
            >
              {isMusicPlaying ? (
                <Pause aria-hidden="true" className="size-5" strokeWidth={2.2} />
              ) : (
                <Music aria-hidden="true" className="size-5" strokeWidth={2.2} />
              )}
            </button>
            <time dateTime={currentTime}>{currentTime}</time>
          </div>
        </header>

        {activeCaseId ? (
          <CaseWindow
            caseId={activeCaseId}
            title={getCaseWindowTitle(activeCaseId)}
            position={caseWindowPosition}
            stageSize={stageSize}
            isDragging={dragState?.target.type === "case-window"}
            isClosing={isCaseWindowClosing}
            isMaximized={isCaseWindowMaximized}
            onClose={hideCaseWindow}
            onMinimize={hideCaseWindow}
            onToggleMaximize={() =>
              setIsCaseWindowMaximized((currentValue) => !currentValue)
            }
            onDragStart={startDrag}
          />
        ) : null}

        <article
          className={`profile-card relative absolute flex w-[min(480px,100%)] touch-none select-none flex-col items-start gap-4 rounded-[32px] bg-black/25 p-6 backdrop-blur-md transition-transform duration-300 ease-out ${
            dragState?.target.type === "card"
              ? "z-10 scale-100 cursor-grabbing"
              : "cursor-pointer hover:scale-[1.04]"
          }`}
          style={
            {
              left: cardPosition.x,
              top: cardPosition.y,
              "--appear-delay": "40ms",
            } as CSSProperties
          }
          onPointerDown={(event) =>
            startDrag(event, { type: "card" }, cardPosition)
          }
        >
          <div className="profile-card-toolbar absolute right-4 top-4 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="status-dot size-3 shrink-0 rounded-full bg-[#34c759]" />
              <p className="whitespace-nowrap text-[14px] font-normal leading-5 tracking-[-0.2px]">
                Открыт для работы
              </p>
            </div>
            <button
              type="button"
              aria-label="Подробнее обо мне"
              className="profile-card-expand grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-white/90 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => showCaseWindow("about-me")}
            >
              <Maximize2
                aria-hidden="true"
                className="size-4"
                strokeWidth={2.2}
              />
            </button>
          </div>

          <ProfileAvatar priority />

          <div className="flex w-full flex-col gap-2">
            <h1>Родион Плехов</h1>
            <p className="text-base font-normal leading-6 tracking-[-0.2px]">
              Привет! Я — дизайнер интерфейсов, работаю в{" "}
              <a
                href="https://sbereducation.ru/"
                target="_blank"
                rel="noreferrer"
                className="rounded-sm underline decoration-white/35 underline-offset-2 transition hover:text-white/80 hover:decoration-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                onPointerDown={(event) => event.stopPropagation()}
              >
                СберОбразовании
              </a>{" "}
              Более 4 лет разрабатываю B2C и B2B системы, сервисы и приложения
            </p>
          </div>
        </article>

        <div className="desktop-files">
          {files.map((file, index) => (
            <DesktopFileIcon
              key={file.id}
              file={file}
              index={index}
              isDragging={
                dragState?.target.type === "file" &&
                dragState.target.id === file.id
              }
              onDragStart={startDrag}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
