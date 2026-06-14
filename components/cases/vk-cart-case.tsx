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
  vkCartIntroImage,
  vkCartScreens,
} from "@/components/cases/shared/image-gallery";
import {
  vkMarketProductBrand,
} from "@/lib/case-data";
import { vkCartFigmaPrototype, inlineLinkClassName } from "@/lib/case-data";
export default function VkCartCase() {
  return (
    <div className="case-content flex min-h-0 w-full flex-1 flex-col gap-10 overflow-y-auto pr-2 text-[#fafafa]">
      <CaseImageGrid images={vkCartIntroImage} />

      <CaseIntro>
        <h1>Корзина — тестовое задание</h1>
        <CaseMeta product={vkMarketProductBrand} year="2024" />
      </CaseIntro>

      <CaseSection title="Задача">
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Сделать редизайн страницы корзины приложения{" "}
          <a
            href="https://vk.com/market"
            target="_blank"
            rel="noreferrer"
            className={inlineLinkClassName}
            onPointerDown={(event) => event.stopPropagation()}
          >
            VK Маркет
          </a>
        </p>
      </CaseSection>

      <CaseSection title="Личные цели">
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>Выполнить задачу за максимально короткий срок — 16 часов</li>
          <li>
            Использовать библиотеку VKUI, позволяющую максимально эффективно
            сэкономить время
          </li>
          <li>Объяснять каждый шаг — почему так было сделано</li>
        </ul>
      </CaseSection>

      <CaseSection title="Исследование">
        <h3>Анализ конкурентов и наблюдение</h3>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          По модели КАНО выделил основные атрибуты корзины конкурентов и
          структурировал информацию
        </p>

        <h3>Интервью</h3>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          Провёл три глубинных интервью с пользователями маркетплейсов В
          выборке были как те, кто пользовался Маркетом, так и нет
        </p>
        <p className="case-description text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <strong className="font-semibold text-white/92">
            Некоторые вопросы респондентам:
          </strong>
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>
            Что вам нравится и не нравится больше всего при оформлении покупки?
          </li>
          <li>
            Попробуйте вспомнить последний раз, когда процесс оформления покупки
            по какой-то причине не мог быть завершён Что вы чувствовали в этот
            момент?
          </li>
          <li>
            Что нужно поменять, добавить или убрать, чтобы вам было удобнее
            оформлять заказ?
          </li>
          <li>
            Какие элементы корзины были самыми важными? А какие — наименее
            важными?
          </li>
        </ul>
      </CaseSection>

      <CaseSection title="Выводы из исследования / Гипотезы">
        <ul className="list-disc space-y-2 pl-5 text-base font-normal leading-6 tracking-[-0.2px] case-body">
          <li>
            Большинство респондентов активно пользуются закладками / избранным
          </li>
          <li>
            Самыми важными критериями являются: цена, отзывы, количество
            заказов
          </li>
          <li>
            Чаще всего респонденты ждут, что им предложат альтернативные товары
            выбранным или дополнительные товары
          </li>
          <li>
            Критерии, на которые респонденты обращают внимание при покупке:
            цена, чёткие фотографии, возможность выбора доставки
          </li>
        </ul>
      </CaseSection>

      <CaseImageGrid images={vkCartScreens} />

      <CaseFigmaPrototype
        title="Прототип в Figma"
        prototypeUrl={vkCartFigmaPrototype}
      />
    </div>
  );
}
