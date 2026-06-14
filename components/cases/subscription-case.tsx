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
  subscriptionIntroImage,
  subscriptionTariffScreens,
  subscriptionManagementScreens,
  subscriptionPaymentScreens,
} from "@/components/cases/shared/image-gallery";
import {
  labProductBrand,
} from "@/lib/case-data";
export default function SubscriptionCase() {
  return (
    <div className="case-content flex min-h-0 w-full flex-1 flex-col gap-10 overflow-y-auto pr-2 text-[#fafafa]">
      <CaseImageGrid images={subscriptionIntroImage} />

      <CaseIntro>
        <h1>Тарифы</h1>
        <CaseMeta product={labProductBrand} year="2026" />
      </CaseIntro>

      <CaseSection title="Контекст">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Чтобы масштабировать продукт и монетизацию, команда решила:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>обновить тарифную линейку</li>
          <li>улучшить UX страницы тарифов</li>
          <li>переработать страницу управления подпиской</li>
          <li>внедрить промокоды</li>
          <li>сделать прозрачные условия автосписаний</li>
          <li>добавить новый тариф «Безлимитный»</li>
        </ul>
      </CaseSection>

      <CaseSection title="Цель исследования">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Понять:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>как показывать тарифы понятно и прозрачно</li>
          <li>как ограничивать бесплатный тариф, не ломая UX</li>
          <li>как стимулировать апгрейд</li>
          <li>как уведомлять о лимитах</li>
          <li>как строить страницу управления подпиской</li>
          <li>какие механики используют ИИ‑сервисы и EdTech</li>
        </ul>
      </CaseSection>

      <CaseSection title="Объекты исследования">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Я проанализировал <strong className="font-semibold text-white/92">15+ сервисов</strong>, среди них:
        </p>
        <h3>ИИ‑сервисы</h3>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Syntx, Perplexity, Gemini, ChatGPT, Claude, Lovable
        </p>
        <h3>EdTech</h3>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Arzamas, Fitstars, MyBook, Premier
        </p>
        <h3>Инструменты для работы</h3>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Zoom, Tilda, Kinescope, Jivo, Fyrebox, Анкетолог
        </p>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Каждый сервис анализировался по единым критериям:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>где расположен вход в тарифы</li>
          <li>как показывают текущий тариф</li>
          <li>как ограничивают бесплатный план</li>
          <li>как уведомляют о лимитах</li>
          <li>как предлагают апгрейд</li>
          <li>как работают автосписания</li>
          <li>как устроена страница тарифов</li>
          <li>как устроена страница управления подпиской</li>
        </ul>
      </CaseSection>

      <CaseImageGrid images={subscriptionTariffScreens} />

      <CaseSection title="Ключевые инсайты исследования">
        <h3>Тарифы должны быть доступны из нескольких точек</h3>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Лучшие сервисы дублируют вход в тарифы:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>верхнее меню</li>
          <li>личный кабинет</li>
          <li>футер</li>
          <li>уведомления о лимитах</li>
        </ul>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Это снижает фрустрацию и повышает конверсию
        </p>

        <h3>Ограничения бесплатного тарифа должны быть видимыми</h3>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Паттерны:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>красные плашки (Tilda, Jivo)</li>
          <li>баннеры внизу экрана</li>
          <li>всплывающие уведомления при превышении лимита</li>
        </ul>

        <h3>Апгрейд — максимально простой</h3>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>1–2 клика</li>
          <li>подсветка рекомендуемого тарифа</li>
          <li>сравнение тарифов на одном экране</li>
        </ul>

        <h3>Даунгрейд — всегда со следующего периода</h3>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Стандарт индустрии:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>апгрейд — сразу</li>
          <li>даунгрейд — с нового биллингового месяца</li>
        </ul>

        <h3>Страница управления подпиской должна отвечать на 3 вопроса</h3>
        <ol className="list-decimal space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>Какой тариф сейчас?</li>
          <li>До какого числа он действует?</li>
          <li>Что я могу сделать дальше?</li>
        </ol>
      </CaseSection>

      <CaseImageGrid images={subscriptionManagementScreens} />

      <CaseImageGrid images={subscriptionPaymentScreens} />
    </div>
  );
}
