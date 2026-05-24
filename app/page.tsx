"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Info, Music, Pause } from "lucide-react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";

type DesktopFile = {
  id: string;
  label: string;
  x: number;
  y: number;
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
const CASE_WINDOW_WIDTH = 936;
const CASE_WINDOW_HEIGHT = 780;
const CASE_WINDOW_ANIMATION_MS = 220;
const MOBILE_LAYOUT_BREAKPOINT = 900;
const NARROW_MOBILE_BREAKPOINT = 520;
const MUSIC_BACKGROUND_VIDEO = "/dancing-rat-chess-type-beat.webm";

const desktopFiles: DesktopFile[] = [
  { id: "home", label: "Главная страница", x: 289, y: 154 },
  { id: "update", label: "Большое обновление", x: 1122, y: 154 },
  { id: "classes", label: "Статистика занятий", x: 804, y: 190 },
  { id: "subscription", label: "Подписка", x: 261, y: 584 },
  { id: "vk-cart", label: "Корзина ВК", x: 613, y: 831 },
  { id: "profile", label: "Единый профиль", x: 1087, y: 716 },
  { id: "tasks", label: "Проверка заданий", x: 1294, y: 328 },
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

function getResponsivePosition(
  position: Position,
  stageSize: StageSize,
  elementSize: StageSize,
  minY = 0,
) {
  return {
    x: clamp(
      (position.x / STAGE_WIDTH) * stageSize.width,
      0,
      Math.max(0, stageSize.width - elementSize.width),
    ),
    y: clamp(
      (position.y / STAGE_HEIGHT) * stageSize.height,
      minY,
      Math.max(minY, stageSize.height - elementSize.height),
    ),
  };
}

function getMobileFilePosition(index: number, stageSize: StageSize) {
  const isNarrow = stageSize.width <= NARROW_MOBILE_BREAKPOINT;
  const sidePadding = isNarrow ? 8 : 14;
  const columns = isNarrow ? 2 : 3;
  const rowGap = isNarrow ? 146 : 150;
  const availableWidth = stageSize.width - sidePadding * 2;
  const cellWidth = availableWidth / columns;
  const column = index % columns;
  const row = Math.floor(index / columns);
  const x = sidePadding + column * cellWidth + (cellWidth - FILE_WIDTH) / 2;
  const y = HEADER_HEIGHT + (isNarrow ? 292 : 284) + row * rowGap;

  return {
    x: clamp(x, 0, Math.max(0, stageSize.width - FILE_WIDTH)),
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
        <div className="h-[72px] w-24 rounded-lg bg-[#fafafa] shadow-[0_0_12px_rgba(0,0,0,0.16)] transition duration-200 group-hover:scale-[1.04] group-focus-visible:scale-[1.04]" />
      </div>
      <p className="desktop-label max-w-32 text-center text-base font-semibold leading-5 tracking-[-0.2px] text-[#fafafa]">
        {file.label}
      </p>
    </button>
  );
}

function CaseWindow({
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
      className={`case-window absolute z-30 flex flex-col gap-8 overflow-hidden rounded-[32px] bg-black/50 p-4 shadow-[0_16px_48px_rgba(0,0,0,0.24)] backdrop-blur-2xl ${
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
        <div className="flex shrink-0 items-center rounded-full bg-white/10 p-[3px]">
          <button
            type="button"
            aria-label="Информация о кейсе"
            className="case-window-action grid size-8 place-items-center rounded-full text-white/90 transition hover:bg-white/10"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <Info
              aria-hidden="true"
              className="size-5"
              strokeWidth={2.1}
            />
          </button>
          <button
            type="button"
            aria-label="Открыть кейс"
            className="case-window-action grid size-8 place-items-center rounded-full text-white/90 transition hover:bg-white/10"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <ArrowUpRight
              aria-hidden="true"
              className="size-5"
              strokeWidth={2.1}
            />
          </button>
        </div>
      </header>

      <div className="flex w-full max-w-[800px] flex-col items-start gap-2 self-center text-[#fafafa]">
        <h2 className="text-[32px] font-semibold leading-10 tracking-[-0.6px]">
          {title}
        </h2>
        <h3 className="text-2xl font-semibold leading-8 tracking-[-0.6px]">
          Кейс скоро появится
        </h3>
        <p className="text-xl font-semibold leading-6 tracking-[-0.6px]">
          Описание и фотографии
        </p>
        <p className="text-base font-normal leading-6 tracking-[-0.2px]">
          Здесь будет подробное описание проекта, задачи, решения и результата.
          Фотографии и материалы можно будет добавить позже.
        </p>
      </div>

      <div className="min-h-[280px] flex-1 rounded-2xl bg-white" />
    </article>
  );
}

export default function Home() {
  const stageRef = useRef<HTMLElement>(null);
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

      setFiles(
        desktopFiles.map((file) => ({
          ...file,
          ...getResponsivePosition(
            file,
            nextStageSize,
            { width: FILE_WIDTH, height: FILE_HEIGHT },
            HEADER_HEIGHT,
          ),
        })),
      );
      setCardPosition(
        getResponsivePosition(
          { x: 560, y: 352 },
          nextStageSize,
          {
            width: Math.min(CARD_WIDTH, nextStageSize.width),
            height: CARD_HEIGHT,
          },
          HEADER_HEIGHT,
        ),
      );
      setCaseWindowPosition(
        getResponsivePosition(
          { x: 44, y: 68 },
          nextStageSize,
          {
            width: Math.min(CASE_WINDOW_WIDTH, nextStageSize.width),
            height: Math.min(CASE_WINDOW_HEIGHT, nextStageSize.height),
          },
          HEADER_HEIGHT,
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

    if (
      currentDragState?.target.type === "file" &&
      !dragMovedRef.current &&
      activeCaseId !== currentDragState.target.id
    ) {
      if (closeWindowTimeoutRef.current) {
        window.clearTimeout(closeWindowTimeoutRef.current);
      }
      setIsCaseWindowClosing(false);
      setIsCaseWindowMaximized(false);
      setActiveCaseId(currentDragState.target.id);
    }

    dragMovedRef.current = false;
    dragStateRef.current = null;
    setDragState(null);
  }

  function hideCaseWindow() {
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

  const activeCase = desktopFiles.find((file) => file.id === activeCaseId);

  return (
    <main className="portfolio-main relative grid h-svh w-screen place-items-center bg-black text-[#fafafa]">
      <video
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          isMusicPlaying ? "opacity-0" : "opacity-100"
        }`}
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/238264.webm" type="video/webm" />
      </video>
      <video
        ref={musicVideoRef}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          isMusicPlaying ? "opacity-100" : "opacity-0"
        }`}
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

        {activeCase ? (
          <CaseWindow
            title={activeCase.label}
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
          className={`profile-card absolute flex w-[min(480px,100%)] touch-none select-none flex-col items-start gap-4 rounded-[32px] bg-black/25 p-6 backdrop-blur-md ${
            dragState?.target.type === "card"
              ? "z-10 cursor-grabbing"
              : "cursor-grab"
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
          <div className="relative size-14 overflow-hidden rounded-full bg-white">
            <Image
              src="/figma-profile-avatar.png"
              alt=""
              fill
              priority
              sizes="56px"
              className="object-cover"
            />
          </div>

          <div className="flex w-full flex-col gap-2">
            <h1 className="text-2xl font-semibold leading-8 tracking-[-0.6px]">
              Родион Плехов
            </h1>
            <p className="text-base font-normal leading-6 tracking-[-0.2px]">
              Привет! Я — дизайнер интерфейсов, работаю в СберОбразовании.
              Более 4 лет разрабатываю B2C B2B системы, сервисы и приложения
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="status-dot size-3 rounded-full bg-[#34c759]" />
            <p className="text-base font-normal leading-6 tracking-[-0.2px]">
              Открыт для работы
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}
