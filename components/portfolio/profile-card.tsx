"use client";

import { Maximize2 } from "lucide-react";
import type { ReactNode } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { ProfileAvatar } from "@/components/cases/shared/image-gallery";
import type { DragTarget, Position } from "@/lib/case-data";

type ProfileCardProps = {
  hero: ReactNode;
  cardPosition: Position;
  isDragging: boolean;
  isMobileLayout: boolean;
  onDragStart: (
    event: ReactPointerEvent<HTMLElement>,
    target: DragTarget,
    position: Position,
  ) => void;
  onExpandAboutMe: () => void;
};

export function ProfileCard({
  hero,
  cardPosition,
  isDragging,
  isMobileLayout,
  onDragStart,
  onExpandAboutMe,
}: ProfileCardProps) {
  return (
    <article
      className={`profile-card relative absolute flex w-[min(480px,100%)] touch-none select-none flex-col items-start gap-4 rounded-[32px] bg-black/25 p-6 backdrop-blur-md transition-transform duration-300 ease-out ${
        isDragging
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
      onPointerDown={(event) => onDragStart(event, { type: "card" }, cardPosition)}
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
          aria-label={isMobileLayout ? "Обо мне" : undefined}
          className="profile-card-expand inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onExpandAboutMe}
        >
          {!isMobileLayout ? (
            <span className="whitespace-nowrap text-[14px] font-normal leading-5 tracking-[-0.2px]">
              Обо мне
            </span>
          ) : null}
          <Maximize2
            aria-hidden="true"
            className="size-3.5"
            strokeWidth={2.2}
          />
        </button>
      </div>

      <ProfileAvatar priority />

      <div className="flex w-full flex-col gap-2">{hero}</div>
    </article>
  );
}
