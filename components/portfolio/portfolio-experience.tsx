"use client";

import Link from "next/link";
import { Music, Pause } from "lucide-react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  PortfolioRatingWindow,
  usePortfolioRating,
} from "@/components/portfolio-rating";
import { CaseWindow } from "@/components/portfolio/case-window";
import { DesktopFileIcon } from "@/components/portfolio/desktop-file-icon";
import { ProfileCard } from "@/components/portfolio/profile-card";
import {
  SitePreloaderOverlay,
  useSitePreloader,
} from "@/components/site-preloader";
import {
  CASE_WINDOW_ANIMATION_MS,
  clamp,
  formatCurrentTime,
  getCaseWindowPositionForCase,
  getDesktopCardPosition,
  getDesktopFileOrbitPositions,
  getMobileCardPosition,
  getMobileFilePosition,
  getMobileStageContentHeight,
  HEADER_HEIGHT,
  MOBILE_LAYOUT_BREAKPOINT,
  STAGE_HEIGHT,
  STAGE_WIDTH,
} from "@/lib/desktop-layout";
import {
  caseWindowTitles,
  CV_PDF,
  desktopFiles,
  MUSIC_BACKGROUND_VIDEO,
  type DragState,
  type DragTarget,
  type Position,
  type StageSize,
} from "@/lib/case-data";
import { withBasePath } from "@/lib/site";

export function PortfolioExperience({ hero }: { hero: React.ReactNode }) {
  const stageRef = useRef<HTMLElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const musicVideoRef = useRef<HTMLVideoElement>(null);
  const { isActive: isPreloaderActive, isExiting: isPreloaderExiting } =
    useSitePreloader();
  const {
    isWindowOpen: isPortfolioRatingWindowOpen,
    saveRating: savePortfolioRating,
    closeRatingWindow: closePortfolioRatingWindow,
  } = usePortfolioRating(!isPreloaderActive);
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
  const [musicVideoSrc, setMusicVideoSrc] = useState<string | null>(null);

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

  useEffect(() => {
    if (!isMusicPlaying || !musicVideoSrc) {
      return;
    }

    const video = musicVideoRef.current;

    if (!video) {
      return;
    }

    const musicVideo = video;

    function startPlayback() {
      musicVideo.muted = false;
      void musicVideo.play().catch(() => {
        musicVideo.muted = true;
        setIsMusicPlaying(false);
      });
    }

    if (musicVideo.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      startPlayback();
      return;
    }

    musicVideo.addEventListener("canplay", startPlayback, { once: true });

    if (musicVideo.readyState === HTMLMediaElement.HAVE_NOTHING) {
      musicVideo.load();
    }

    return () => {
      musicVideo.removeEventListener("canplay", startPlayback);
    };
  }, [isMusicPlaying, musicVideoSrc]);

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

    if (!musicVideoSrc) {
      setMusicVideoSrc(MUSIC_BACKGROUND_VIDEO);
    }

    setIsMusicPlaying(true);
  }

  const isMobileLayout = stageSize.width <= MOBILE_LAYOUT_BREAKPOINT;
  const mobileStageMinHeight = isMobileLayout
    ? Math.max(
        stageSize.height,
        getMobileStageContentHeight(files, cardPosition),
      )
    : undefined;

  return (
    <>
      {isPreloaderActive ? (
        <SitePreloaderOverlay isExiting={isPreloaderExiting} />
      ) : null}
      <main
        className={`portfolio-main relative grid w-screen bg-black text-[#fafafa] ${
          isMobileLayout
            ? "min-h-svh h-auto place-items-stretch"
            : "h-svh place-items-center"
        }`}
      >
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
        preload="metadata"
        poster={withBasePath("/wall-poster.webp")}
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
      {musicVideoSrc ? (
        <video
          ref={musicVideoRef}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            isMusicPlaying ? "opacity-100" : "opacity-0"
          }`}
          loop
          muted
          playsInline
          preload="none"
        >
          <source src={musicVideoSrc} type="video/webm" />
        </video>
      ) : null}
      <div className="absolute inset-0 bg-black/35" />

      <section
        ref={stageRef}
        aria-label="Портфолио Родиона Плехова"
        className={`figma-stage relative w-full shrink-0 ${
          isMobileLayout
            ? "min-h-full overflow-visible"
            : "h-full overflow-hidden"
        }`}
        style={
          mobileStageMinHeight
            ? { minHeight: mobileStageMinHeight }
            : undefined
        }
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
              href={CV_PDF}
              target="_blank"
              rel="noreferrer"
              className="rounded-md transition hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
            >
              Резюме
            </a>
            <a
              href="https://t.me/r_plekhov"
              target="_blank"
              rel="noreferrer"
              className="rounded-md transition hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
            >
              Телеграм
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
          <div
            className="absolute inset-x-0 bottom-0 z-20"
            style={{ top: HEADER_HEIGHT }}
            aria-hidden="true"
            onClick={hideCaseWindow}
          />
        ) : null}

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

        <ProfileCard
          hero={hero}
          cardPosition={cardPosition}
          isDragging={dragState?.target.type === "card"}
          isMobileLayout={isMobileLayout}
          onDragStart={startDrag}
          onExpandAboutMe={() => showCaseWindow("about-me")}
        />

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

        <PortfolioRatingWindow
          isOpen={isPortfolioRatingWindowOpen}
          onClose={closePortfolioRatingWindow}
          onRate={savePortfolioRating}
        />
      </section>
    </main>
    </>
  );
}
