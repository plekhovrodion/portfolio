"use client";

import { CaseIntro, CaseSection } from "@/components/cases/shared/image-gallery";

export function CasePlaceholder({ title }: { title: string }) {
  return (
    <>
      <div className="case-content flex min-h-0 w-full flex-1 flex-col gap-10 overflow-y-auto pr-2 text-[#fafafa]">
        <CaseIntro>
          <h1>{title}</h1>
        </CaseIntro>
        <CaseSection title="Кейс скоро появится">
          <p className="case-lead text-xl font-semibold leading-7 tracking-[-0.6px] text-white/86">
            Описание и фотографии
          </p>
          <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
            Здесь будет подробное описание проекта, задачи, решения и результата.
            Фотографии и материалы можно будет добавить позже
          </p>
        </CaseSection>

        <div className="min-h-[280px] flex-1 rounded-2xl bg-white" />
      </div>
    </>
  );
}