"use client";

import dynamic from "next/dynamic";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { CasePlaceholder } from "@/components/cases/case-placeholder";
import {
  CASE_WINDOW_HEIGHT,
  CASE_WINDOW_WIDTH,
  HEADER_HEIGHT,
} from "@/lib/desktop-layout";
import type { DragTarget, Position, StageSize } from "@/lib/case-data";

function CaseSkeleton() {
  return (
    <div className="case-content flex min-h-0 w-full flex-1 items-center justify-center pr-2 text-sm text-white/60">
      Загрузка…
    </div>
  );
}

const AboutMeCase = dynamic(() => import("@/components/cases/about-me-case"), {
  loading: CaseSkeleton,
});
const HomePageCase = dynamic(() => import("@/components/cases/home-page-case"), {
  loading: CaseSkeleton,
});
const UnifiedProfileCase = dynamic(
  () => import("@/components/cases/unified-profile-case"),
  { loading: CaseSkeleton },
);
const AssistantPromoCase = dynamic(
  () => import("@/components/cases/assistant-promo-case"),
  { loading: CaseSkeleton },
);
const MotionCase = dynamic(() => import("@/components/cases/motion-case"), {
  loading: CaseSkeleton,
});
const ClassesStatisticsCase = dynamic(
  () => import("@/components/cases/classes-statistics-case"),
  { loading: CaseSkeleton },
);
const AiAssistantCase = dynamic(
  () => import("@/components/cases/ai-assistant-case"),
  { loading: CaseSkeleton },
);
const SubscriptionCase = dynamic(
  () => import("@/components/cases/subscription-case"),
  { loading: CaseSkeleton },
);
const VkCartCase = dynamic(() => import("@/components/cases/vk-cart-case"), {
  loading: CaseSkeleton,
});

type CaseWindowProps = {
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
};

function CaseContent({ caseId, title }: { caseId: string; title: string }) {
  switch (caseId) {
    case "about-me":
      return <AboutMeCase />;
    case "home":
      return <HomePageCase />;
    case "profile":
      return <UnifiedProfileCase />;
    case "assistant-promo":
      return <AssistantPromoCase />;
    case "motion":
      return <MotionCase />;
    case "classes":
      return <ClassesStatisticsCase />;
    case "ai-assistant":
      return <AiAssistantCase />;
    case "subscription":
      return <SubscriptionCase />;
    case "vk-cart":
      return <VkCartCase />;
    default:
      return <CasePlaceholder title={title} />;
  }
}

export function CaseWindow({
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
}: CaseWindowProps) {
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
            aria-label="Свернуть окно"
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

      <CaseContent caseId={caseId} title={title} />
    </article>
  );
}
