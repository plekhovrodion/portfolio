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
  profileIntroImage,
  profileSsoImages,
  profileGalleryImages,
} from "@/components/cases/shared/image-gallery";
import {
  profileProductBrand,
  inlineLinkClassName,
} from "@/lib/case-data";
export default function UnifiedProfileCase() {
  return (
    <div className="case-content flex min-h-0 w-full flex-1 flex-col gap-10 overflow-y-auto pr-2 text-[#fafafa]">
      <CaseImageGrid images={profileIntroImage} />

      <CaseIntro>
        <h1>Единый профиль</h1>
        <CaseMeta product={profileProductBrand} year="2024" />
      </CaseIntro>

      <CaseSection title="Контекст">
        <p className="case-lead text-xl font-semibold leading-7 tracking-[-0.6px] text-white/86">
          У{" "}
          <a
            href="https://sbereducation.ru/"
            target="_blank"
            rel="noreferrer"
            className={inlineLinkClassName}
            onPointerDown={(event) => event.stopPropagation()}
          >
            СберОбразования
          </a>{" "}
          было четыре независимых продукта, каждый со своим:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>входом и регистрацией</li>
          <li>админкой</li>
          <li>базой пользователей</li>
          <li>логикой авторизации</li>
        </ul>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Команда тратила много времени на поддержку четырёх разных систем, а
          пользователи путались и теряли доступ
        </p>
      </CaseSection>

      <CaseSection title="Цель проекта">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Создать единый аккаунт для всех сервисов, чтобы:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>упростить вход и регистрацию</li>
          <li>снизить нагрузку на поддержку</li>
          <li>повысить конверсию в регистрацию</li>
          <li>обеспечить единый профиль пользователя</li>
        </ul>
      </CaseSection>

      <CaseSection title="Критерии успеха">
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>снижение обращений в поддержку по входу</li>
          <li>рост регистраций</li>
          <li>подключение остальных продуктов к единому аккаунту</li>
          <li>сокращение времени на поддержку</li>
        </ul>
      </CaseSection>

      <CaseSection title="Моя роль">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Я работал как продуктовый дизайнер и отвечал за полный цикл:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>формирование понимания задачи</li>
          <li>дискавери и исследование</li>
          <li>формирование и приоритизация гипотез</li>
          <li>проектирование UX/UI</li>
          <li>согласование с разработкой</li>
          <li>авторский надзор до релиза</li>
        </ul>
      </CaseSection>

      <CaseImageGrid images={profileSsoImages} />

      <CaseSection title="Исследование">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Провёл анализ четырёх продуктов
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>изучил воронки входа и регистрации</li>
          <li>нашёл точки, где пользователи чаще всего «спотыкаются»</li>
          <li>выявил несоответствия в логике и UI</li>
        </ul>
      </CaseSection>

      <CaseSection title="Анализ аналогов">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Изучил лучшие практики:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>Яндекс ID</li>
          <li>ВК ID</li>
          <li>Госуслуги</li>
          <li>Skyeng</li>
          <li>Фоксфорд</li>
        </ul>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Собрал паттерны по:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>регистрации</li>
          <li>восстановлению доступа</li>
          <li>двухфакторной аутентификации</li>
          <li>управлению профилем</li>
        </ul>
      </CaseSection>

      <CaseSection title="Гипотезы">
        <ol className="list-decimal space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>Единый аккаунт снизит количество обращений в поддержку</li>
          <li>
            Упрощённая регистрация (телефон/email + OTP) повысит конверсию
          </li>
          <li>
            Единый профиль уменьшит количество ошибок при передаче данных между
            сервисами
          </li>
          <li>Двухфакторная аутентификация повысит доверие пользователей</li>
        </ol>
      </CaseSection>

      <CaseSection title="CJM">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Построил путь пользователя от входа до заполнения профиля
        </p>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Нашёл узкие места:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>лишние шаги</li>
          <li>непонятные статусы</li>
          <li>дублирующие поля</li>
          <li>отсутствие единой логики</li>
        </ul>
      </CaseSection>

      <CaseImageGrid images={profileGalleryImages} />

      <CaseSection title="UX-тестирование">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Провели тестирование прототипов на 12 респондентах:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>6 родителей</li>
          <li>6 школьников</li>
        </ul>
        <h3>Что выявили:</h3>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>путаница в шагах регистрации</li>
          <li>непонимание, зачем нужен пароль после OTP</li>
          <li>сложности с подтверждением email</li>
        </ul>
        <h3>Что улучшили:</h3>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>последовательность шагов</li>
          <li>тексты и подсказки</li>
          <li>визуальные статусы</li>
        </ul>
      </CaseSection>

    </div>
  );
}
