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
  aiIntroImage,
  aiMobileScreens,
  aiDesktopScreens,
} from "@/components/cases/shared/image-gallery";
import {
  labProductBrand,
} from "@/lib/case-data";
export default function AiAssistantCase() {
  return (
    <div className="case-content flex min-h-0 w-full flex-1 flex-col gap-10 overflow-y-auto pr-2 text-[#fafafa]">
      <CaseImageGrid images={aiIntroImage} />

      <CaseIntro>
        <h1>ИИ-помощник</h1>
        <CaseMeta product={labProductBrand} year="2025" />
      </CaseIntro>

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
