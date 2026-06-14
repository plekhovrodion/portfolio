"use client";

import { useRef } from "react";
import {
  CaseImageGrid,
  CaseIntro,
  CaseMeta,
  CaseScrollJumpButton,
  CaseSection,
  ProfileAvatar,
} from "@/components/cases/shared/image-gallery";
import {
  homeIntroVideo,
  mainPageCoverImage,
  mainPageMobileScreens,
  mainPageDesktopScreens,
  mainPageUiLandscapeScreens,
  mainPageUiMobileScreens,
} from "@/components/cases/shared/image-gallery";
import {
  labProductBrand,
} from "@/lib/case-data";
import { CaseMotionGrid } from "@/components/cases/shared/media-and-motion";
export default function HomePageCase() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col">
      <div
        ref={scrollContainerRef}
        className="case-content flex min-h-0 w-full flex-1 flex-col gap-10 overflow-y-auto pr-2 text-[#fafafa]"
      >
      <CaseMotionGrid videos={[homeIntroVideo]} />

      <CaseIntro>
        <h1>Главная страница</h1>
        <CaseMeta product={labProductBrand} year="Декабрь 2025" />
      </CaseIntro>

      <CaseSection title="Контекст">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Платформа позволяет репетиторам:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>проводить онлайн‑занятия</li>
          <li>создавать и выдавать задания</li>
          <li>проверять работы</li>
          <li>отслеживать прогресс каждого ученика</li>
        </ul>
      </CaseSection>

      <CaseSection title="Проблема">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Главная страница была перегружена, не помогала быстро переходить к
          созданию контента и не стимулировала использование ИИ‑функциональности
        </p>
      </CaseSection>

      <CaseSection title="Задачи">
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>сократить количество кликов до целевого действия</li>
          <li>
            объединить библиотеку и главную страницу в единый рабочий центр
          </li>
          <li>повысить использование ИИ‑функционала</li>
          <li>увеличить количество создаваемых заданий</li>
          <li>улучшить конверсию в выдачу заданий ученикам</li>
        </ul>
      </CaseSection>

      <CaseSection title="Моя роль">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Я отвечал за:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>анализ пользовательских сценариев</li>
          <li>формирование гипотез</li>
          <li>проектирование UX главной страницы</li>
          <li>интеграцию ИИ‑функций в ключевые точки</li>
          <li>согласование с продуктом и разработкой</li>
          <li>авторский надзор после релиза</li>
        </ul>
      </CaseSection>

      <CaseSection title="Исследование">
        <h3>Что обнаружили:</h3>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>
            пользователи тратят слишком много времени, чтобы добраться до
            создания задания
          </li>
          <li>ИИ‑функции были «спрятаны» и использовались редко</li>
          <li>библиотека и главная дублировали функции</li>
          <li>
            репетиторы часто создают задания, но не всегда доходят до выдачи
            ученикам
          </li>
        </ul>
        <h3>Гипотезы:</h3>
        <ol className="list-decimal space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>
            Если вынести ИИ‑создание контента на первый экран — вырастет
            использование ИИ
          </li>
          <li>
            Если объединить библиотеку и главную — сократится путь до целевого
            действия
          </li>
          <li>
            Если показать недавние материалы и быстрые действия — увеличится
            количество создаваемых заданий
          </li>
        </ol>
      </CaseSection>

      <CaseSection title="Экраны" id="home-case-screens">
        <CaseImageGrid images={mainPageCoverImage} cursorTooltip />
        <CaseImageGrid images={mainPageMobileScreens} cursorTooltip />
        <CaseImageGrid images={mainPageDesktopScreens} cursorTooltip />
        <CaseImageGrid images={mainPageUiLandscapeScreens} cursorTooltip />
        <CaseImageGrid images={mainPageUiMobileScreens} cursorTooltip />
      </CaseSection>

      <CaseSection title="Результаты" id="home-case-results">
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>доля использований ИИ: +72%</li>
          <li>созданных заданий на преподавателя: +45%</li>
          <li>конверсия учителей в ИИ‑чаты: +175%</li>
          <li>конверсия в ИИ‑генерацию заданий: +51%</li>
        </ul>
      </CaseSection>
      </div>

      <CaseScrollJumpButton
        scrollContainerRef={scrollContainerRef}
        targetId="home-case-results"
        label="Результаты"
      />
    </div>
  );
}
