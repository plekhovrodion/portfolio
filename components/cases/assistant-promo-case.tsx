"use client";

import {
  CaseFigmaPrototype,
  CaseImageGrid,
  CaseIntro,
  CaseMeta,
  CaseScrollJumpButton,
  CaseSection,
  ProfileAvatar,
} from "@/components/cases/shared/image-gallery";
import {
  assistantPromoFrames,
} from "@/components/cases/shared/image-gallery";
import {
  assistantProductBrand,
} from "@/lib/case-data";
import { CaseVideo } from "@/components/cases/shared/media-and-motion";
import { withBasePath } from "@/lib/site";
export default function AssistantPromoCase() {
  return (
    <div className="case-content flex min-h-0 w-full flex-1 flex-col gap-10 overflow-y-auto pr-2 text-[#fafafa]">
      <CaseVideo
        src={withBasePath("/assistant-promo.webm")}
        title="Промо Ассистента преподавателя"
        mimeType="video/webm"
      />

      <CaseIntro>
        <h1>Промо</h1>
        <CaseMeta product={assistantProductBrand} year="2024" />
      </CaseIntro>

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
