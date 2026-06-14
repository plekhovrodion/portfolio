"use client";

import { CaseMotionGrid } from "@/components/cases/shared/media-and-motion";
import { motionPlaylist } from "@/components/cases/shared/media-and-motion";

export default function MotionCase() {
  return (
    <div className="case-content flex min-h-0 w-full flex-1 flex-col gap-10 overflow-y-auto pr-2 text-[#fafafa]">
      <CaseMotionGrid videos={motionPlaylist} />
    </div>
  );
}
