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
import { CaseMotionGrid } from "@/components/cases/shared/media-and-motion";
import { AboutMeContacts } from "@/components/cases/shared/about-me-contacts";
import {
  aboutMeProductHighlights,
  aboutMeTeamHighlights,
  inlineLinkClassName,
} from "@/lib/case-data";

export default function AboutMeCase() {
  return (
    <div className="case-content flex min-h-0 w-full flex-1 flex-col gap-10 overflow-y-auto pr-2 text-[#fafafa]">
      <CaseIntro>
        <ProfileAvatar size="md" />
        <h1>Родион Плехов</h1>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Продуктовый дизайнер в{" "}
          <a
            href="https://sbereducation.ru/"
            target="_blank"
            rel="noreferrer"
            className={inlineLinkClassName}
            onPointerDown={(event) => event.stopPropagation()}
          >
            СберОбразовании
          </a>{" "}
          Более 4 лет разрабатываю B2C и B2B системы, сервисы и приложения
        </p>
      </CaseIntro>

      <AboutMeContacts />

      <CaseSection title="Достижения">
        <div className="flex flex-col gap-6">
          <div>
            <h3>Продукты</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
              {aboutMeProductHighlights.map((item) => (
                <li key={item.title}>
                  <span className="font-semibold">
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className={inlineLinkClassName}
                        onPointerDown={(event) => event.stopPropagation()}
                      >
                        {item.title}:
                      </a>
                    ) : (
                      `${item.title}:`
                    )}
                  </span>{" "}
                  {item.description}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Команда</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
              {aboutMeTeamHighlights.map((item) => (
                <li key={item.title}>
                  <span className="font-semibold">{item.title}:</span>{" "}
                  {item.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CaseSection>

      <CaseSection title="Опыт работы">
        <ul className="space-y-4 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>
            <p className="font-semibold text-white/92">
              <a
                href="https://sbereducation.ru/"
                target="_blank"
                rel="noreferrer"
                className={inlineLinkClassName}
                onPointerDown={(event) => event.stopPropagation()}
              >
                СберОбразование
              </a>
            </p>
            <p>Продуктовый дизайнер · Июль 2023 — сейчас (2 года и 11 месяцев)</p>
          </li>
          <li>
            <p className="font-semibold text-white/92">AINSYS</p>
            <p>Продуктовый дизайнер · 2 года и 3 месяца</p>
          </li>
          <li>
            <p className="font-semibold text-white/92">
              <a
                href="https://gpbl.ru/"
                target="_blank"
                rel="noreferrer"
                className={inlineLinkClassName}
                onPointerDown={(event) => event.stopPropagation()}
              >
                Газпромбанк Лизинг, ЗАО
              </a>
            </p>
            <p>Графический дизайнер · Июнь 2021 — Июнь 2023 (2 года и 1 месяц)</p>
          </li>
        </ul>
      </CaseSection>
    </div>
  );
}
