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
  statisticIntroImage,
  statisticScreens,
} from "@/components/cases/shared/image-gallery";
import {
  assistantProductBrand,
  inlineLinkClassName,
} from "@/lib/case-data";
export default function ClassesStatisticsCase() {
  return (
    <div className="case-content flex min-h-0 w-full flex-1 flex-col gap-10 overflow-y-auto pr-2 text-[#fafafa]">
      <CaseImageGrid images={statisticIntroImage} />

      <CaseIntro>
        <h1>Статистика занятий</h1>
        <CaseMeta product={assistantProductBrand} year="2025" />
      </CaseIntro>

      <CaseSection title="Контекст">
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
      </CaseSection>

      <CaseSection title="Проблема">
        <blockquote className="case-lead border-l-2 border-white/30 pl-4 text-xl font-semibold leading-7 tracking-[-0.6px] text-white/86">
          Преподаватель не может увидеть, как меняются его метрики и приёмы
          преподавания в динамике
        </blockquote>
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
