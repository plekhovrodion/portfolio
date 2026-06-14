"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import {
  desktopFilePreviews,
  type DesktopFile,
  type DragTarget,
  type Position,
  type StageSize,
} from "@/lib/case-data";
import { withBasePath } from "@/lib/site";
import { useMediaReady, MediaSkeleton } from "@/components/cases/shared/media-and-motion";

function DesktopFilePreview({ src }: { src: string }) {
  const { isReady, markReady, bindMediaRef } = useMediaReady(src);
  return (
    <>
      {!isReady ? <MediaSkeleton className="absolute inset-0" /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={bindMediaRef}
        src={src}
        alt=""
        width={96}
        height={72}
        decoding="async"
        loading="lazy"
        className={`desktop-file-icon__asset desktop-file-icon__asset--cover ${isReady ? "media-loaded" : "media-loading"}`}
        onLoad={markReady}
      />
    </>
  );
}

export function DesktopFileIcon({
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
      className={`desktop-file absolute flex w-32 touch-none select-none appearance-none flex-col items-center gap-2 border-0 bg-transparent p-0 focus-visible:outline-none ${
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
      <div className="desktop-file-icon">
        {file.variant === "folder" ? (
          <div className="desktop-file-icon__visual desktop-file-icon__visual--folder">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={withBasePath("/icons/folder.svg")}
              alt=""
              width={96}
              height={72}
              decoding="async"
              className="desktop-file-icon__asset desktop-file-icon__asset--folder"
            />
          </div>
        ) : (
          <div className="desktop-file-icon__visual desktop-file-icon__visual--preview">
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
