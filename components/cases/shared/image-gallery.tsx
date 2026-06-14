"use client";

import Image from "next/image";
import { ChevronDown, X } from "lucide-react";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactPortal,
} from "react";
import { createPortal } from "react-dom";
import {
  assistantProductBrand,
  labProductBrand,
  profileProductBrand,
  vkMarketProductBrand,
  type CaseMetaBrand,
} from "@/lib/case-data";
import {
  CASE_LIGHTBOX_ANIMATION_MS,
  LIGHTBOX_SWIPE_THRESHOLD,
} from "@/lib/desktop-layout";
import { withBasePath } from "@/lib/site";
import {
  MediaSkeleton,
  useLightboxGalleryNavigation,
  useMediaReady,
  type MotionVideo,
} from "@/components/cases/shared/media-and-motion";

export { CaseMeta } from "@/components/cases/shared/case-meta";
export { assistantProductBrand, labProductBrand, profileProductBrand, vkMarketProductBrand };
export type { CaseMetaBrand };

export type CaseImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  layout?: "solo";
  caption?: string;
};

export const profileAvatarImage: CaseImage = {
  src: withBasePath("/profile@2x.webp"),
  alt: "Родион Плехов",
  width: 640,
  height: 640,
};

export const profileAvatarGallery: ReadonlyArray<CaseImage> = [profileAvatarImage];

export type CaseImageGroup =
  | { type: "landscape"; images: CaseImage[] }
  | { type: "portrait"; images: CaseImage[] }
  | { type: "solo"; images: CaseImage[] };

export function isPortraitCaseImage(image: CaseImage) {
  return image.height > image.width;
}

export function groupCaseImages(
  images: ReadonlyArray<CaseImage>,
): CaseImageGroup[] {
  const groups: CaseImageGroup[] = [];
  let landscapeBatch: CaseImage[] = [];
  let portraitBatch: CaseImage[] = [];

  function flushLandscapeBatch() {
    if (landscapeBatch.length === 0) {
      return;
    }

    groups.push({ type: "landscape", images: landscapeBatch });
    landscapeBatch = [];
  }

  function flushPortraitBatch() {
    if (portraitBatch.length === 0) {
      return;
    }

    groups.push({ type: "portrait", images: portraitBatch });
    portraitBatch = [];
  }

  for (const image of images) {
    if (image.layout === "solo") {
      flushLandscapeBatch();
      flushPortraitBatch();
      groups.push({ type: "solo", images: [image] });
      continue;
    }

    if (isPortraitCaseImage(image)) {
      flushLandscapeBatch();
      portraitBatch.push(image);
      continue;
    }

    flushPortraitBatch();
    landscapeBatch.push(image);
  }

  flushLandscapeBatch();
  flushPortraitBatch();

  return groups;
}

export const profileIntroImage = [
  {
    src: withBasePath("/cases/profile/login-desktop.png"),
    alt: "Вход в аккаунт — веб",
    width: 1024,
    height: 767,
  },
] as const satisfies ReadonlyArray<CaseImage>;

export const profileSsoImages = [
  {
    src: withBasePath("/cases/profile/redirect-loading.png"),
    alt: "Переход в сервис после входа",
    width: 1024,
    height: 767,
  },
] as const satisfies ReadonlyArray<CaseImage>;

const profileAuthFlowImages = [
  {
    src: withBasePath("/cases/profile/login-desktop.png"),
    alt: "Вход в аккаунт — веб",
    width: 1024,
    height: 767,
  },
  {
    src: withBasePath("/cases/profile/otp-desktop.png"),
    alt: "Ввод кода из СМС — веб",
    width: 1024,
    height: 767,
  },
  {
    src: withBasePath("/cases/profile/login-mobile.png"),
    alt: "Вход в аккаунт — мобильная версия",
    width: 473,
    height: 1024,
  },
  {
    src: withBasePath("/cases/profile/otp-mobile.png"),
    alt: "Ввод кода из СМС — мобильная версия",
    width: 473,
    height: 1024,
  },
  {
    src: withBasePath("/cases/profile/email-confirm-mobile.png"),
    alt: "Подтверждение электронной почты",
    width: 473,
    height: 1024,
  },
] as const satisfies ReadonlyArray<CaseImage>;

const profilePageImage = [
  {
    src: withBasePath("/cases/profile/profile-page.png"),
    alt: "Профиль пользователя: данные, контакты и школа",
    width: 824,
    height: 1024,
    layout: "solo",
  },
] as const satisfies ReadonlyArray<CaseImage>;

const profileScreensImages = [
  {
    src: withBasePath("/cases/profile/account-protection.png"),
    alt: "Защита аккаунта: логин и пароль",
    width: 1024,
    height: 767,
  },
] as const satisfies ReadonlyArray<CaseImage>;

const profileErrorImages = [
  {
    src: withBasePath("/cases/profile/error-login-failed.png"),
    alt: "Ошибка входа в аккаунт",
    width: 1024,
    height: 767,
  },
  {
    src: withBasePath("/cases/profile/error-service-unavailable.png"),
    alt: "Сервис временно недоступен",
    width: 1024,
    height: 767,
  },
] as const satisfies ReadonlyArray<CaseImage>;

export const profileGalleryImages: CaseImage[] = [
  ...profileAuthFlowImages,
  ...profilePageImage,
  ...profileScreensImages,
  ...profileErrorImages,
];

export const mainPageCoverImage = [
  {
    src: withBasePath("/cases/main/video.png"),
    alt: "Пустая главная без заданий с саджестами",
    caption: "Пустая главная без заданий и с саджестами",
    width: 2048,
    height: 1200,
    layout: "solo",
  },
] as const satisfies ReadonlyArray<CaseImage>;

export const mainPageMobileScreens = [
  {
    src: withBasePath("/cases/main/screen-1.png"),
    alt: "Главная страница — мобильная версия",
    caption: "Мобильная версия главной",
    width: 640,
    height: 1400,
  },
  {
    src: withBasePath("/cases/main/screen-2.png"),
    alt: "Онбординг-тултип на главной",
    caption: "Онбординг-тултип",
    width: 640,
    height: 1400,
  },
  {
    src: withBasePath("/cases/main/screen-3.png"),
    alt: "Настройка вопросов",
    caption: "Настройка вопросов",
    width: 640,
    height: 1400,
  },
] as const satisfies ReadonlyArray<CaseImage>;

export const mainPageDesktopScreens = [
  {
    src: withBasePath("/cases/main/video-4.png"),
    alt: "Заполненная главная с папками и заданиями",
    caption: "Заполненная главная с папками и заданиями",
    width: 2048,
    height: 1200,
  },
  {
    src: withBasePath("/cases/main/video-1.png"),
    alt: "Заполненная главная с папками и заданиями",
    caption: "Заполненная главная с папками и заданиями",
    width: 2048,
    height: 1200,
  },
  {
    src: withBasePath("/cases/main/video-2.png"),
    alt: "Создание новой папки",
    caption: "Создание новой папки",
    width: 2048,
    height: 1200,
  },
  {
    src: withBasePath("/cases/main/video-3.png"),
    alt: "Модальное окно удаления задания",
    caption: "Модальное окно удаления задания",
    width: 2048,
    height: 1200,
  },
] as const satisfies ReadonlyArray<CaseImage>;

export const mainPageUiLandscapeScreens = [
  {
    src: withBasePath("/cases/main/ui/task-cards.png"),
    alt: "Карточки заданий — состояния и правила",
    caption: "Состояния карточек заданий и правила отображения",
    width: 4968,
    height: 2402,
    layout: "solo",
  },
  {
    src: withBasePath("/cases/main/ui/folders.png"),
    alt: "Папки — состояния и цветовые темы",
    caption: "Папки: состояния, цветовые темы и счётчики",
    width: 3416,
    height: 1530,
    layout: "solo",
  },
  {
    src: withBasePath("/cases/main/ui/move-task-menu.png"),
    alt: "Пункт «Переместить» в меню задания",
    caption: "Пункт «Переместить» в контекстном меню задания",
    width: 3456,
    height: 2048,
    layout: "solo",
  },
  {
    src: withBasePath("/cases/main/ui/move-modal.png"),
    alt: "Модальное окно перемещения задания в папку",
    caption: "Модальное окно выбора папки для перемещения задания",
    width: 6140,
    height: 1884,
    layout: "solo",
  },
] as const satisfies ReadonlyArray<CaseImage>;

export const mainPageUiMobileScreens = [
  {
    src: withBasePath("/cases/main/ui/task-constructor.png"),
    alt: "Конструктор заданий — мобильный экран",
    caption: "Конструктор заданий на мобильном экране",
    width: 720,
    height: 1600,
  },
  {
    src: withBasePath("/cases/main/ui/task-menu.png"),
    alt: "Меню действий с заданием",
    caption: "Меню действий с заданием: переместить, редактировать, удалить",
    width: 720,
    height: 1600,
  },
  {
    src: withBasePath("/cases/main/ui/edit-folder.png"),
    alt: "Редактирование папки — название и цвет",
    caption: "Редактирование папки: название и цветовая тема",
    width: 720,
    height: 1600,
  },
] as const satisfies ReadonlyArray<CaseImage>;

export const statisticIntroImage = [
  {
    src: withBasePath("/cases/statistic/metrics-overview.png"),
    alt: "Страница статистики — динамика метрик",
    width: 3456,
    height: 3184,
  },
] as const satisfies ReadonlyArray<CaseImage>;

export const aiIntroImage = [
  {
    src: withBasePath("/cases/ai/home-desktop.png"),
    alt: "Главный экран — веб",
    width: 3456,
    height: 2048,
  },
] as const satisfies ReadonlyArray<CaseImage>;

export const aiMobileScreens = [
  {
    src: withBasePath("/cases/ai/home-mobile.png"),
    alt: "Главный экран — мобильная версия",
    width: 720,
    height: 1688,
  },
  {
    src: withBasePath("/cases/ai/compose-mobile.png"),
    alt: "Ввод запроса и выбор сценария",
    width: 720,
    height: 1688,
  },
  {
    src: withBasePath("/cases/ai/history-mobile.png"),
    alt: "История чатов",
    width: 720,
    height: 1688,
  },
] as const satisfies ReadonlyArray<CaseImage>;

export const aiDesktopScreens = [
  {
    src: withBasePath("/cases/ai/lesson-planning-desktop.png"),
    alt: "Планирование занятий",
    width: 3456,
    height: 2048,
  },
  {
    src: withBasePath("/cases/ai/chat-desktop.png"),
    alt: "Чат с математической клавиатурой",
    width: 3456,
    height: 2048,
  },
  {
    src: withBasePath("/cases/ai/math-keyboard-spec.png"),
    alt: "Математическая клавиатура — спецификация",
    width: 3476,
    height: 1756,
    layout: "solo",
  },
] as const satisfies ReadonlyArray<CaseImage>;

export const statisticScreens = [
  {
    src: withBasePath("/cases/statistic/filters.png"),
    alt: "Фильтры — предмет, класс и период",
    width: 3456,
    height: 2048,
  },
  {
    src: withBasePath("/cases/statistic/statistics-screen.png"),
    alt: "Страница статистики — обзор метрик",
    width: 2712,
    height: 1510,
  },
  {
    src: withBasePath("/cases/statistic/period-comparison.png"),
    alt: "Сравнение показателей за период",
    width: 3456,
    height: 2048,
  },
  {
    src: withBasePath("/cases/statistic/conversation-distribution.png"),
    alt: "Распределение разговора на уроке",
    width: 3456,
    height: 2048,
  },
  {
    src: withBasePath("/cases/statistic/emotional-modality.png"),
    alt: "Эмоциональная модальность",
    width: 3456,
    height: 2048,
  },
  {
    src: withBasePath("/cases/statistic/empty-state.png"),
    alt: "Пустое состояние — нет данных за период",
    width: 3456,
    height: 2048,
  },
] as const satisfies ReadonlyArray<CaseImage>;

export const assistantPromoFrames = [
  {
    src: withBasePath("/cases/assistant-promo/1.avif"),
    alt: "Поле ввода ассистента: «Напишите, с чем вам помочь»",
    width: 1024,
    height: 567,
  },
  {
    src: withBasePath("/cases/assistant-promo/2.avif"),
    alt: "Кадр промо: «Попробуйте»",
    width: 1024,
    height: 567,
  },
  {
    src: withBasePath("/cases/assistant-promo/3.avif"),
    alt: "Кнопка «Создавайте задания» с ИИ-иконкой",
    width: 1024,
    height: 565,
  },
  {
    src: withBasePath("/cases/assistant-promo/4.avif"),
    alt: "Расписание занятий в интерфейсе ассистента",
    width: 1024,
    height: 570,
  },
] as const;


export const homeIntroVideo: MotionVideo = {
  src: withBasePath("/motion/landing-hero.mp4"),
  title: "Hero-блок лендинга",
  mimeType: "video/mp4",
};

export const subscriptionIntroImage = [
  {
    src: withBasePath("/cases/subscribe/Тарифы.png"),
    alt: "Страница тарифов — сравнение планов",
    width: 3456,
    height: 2004,
    layout: "solo",
  },
] as const satisfies ReadonlyArray<CaseImage>;

export const subscriptionTariffScreens = [
  {
    src: withBasePath("/cases/subscribe/Страница тарифаов.png"),
    alt: "Страница тарифов — обновлённая линейка",
    width: 3456,
    height: 2976,
    layout: "solo",
  },
  {
    src: withBasePath("/cases/subscribe/Безлимитный.png"),
    alt: "Новый тариф «Безлимитный»",
    width: 3456,
    height: 2048,
  },
] as const satisfies ReadonlyArray<CaseImage>;

export const subscriptionManagementScreens = [
  {
    src: withBasePath("/cases/subscribe/Банковские карты.png"),
    alt: "Управление подпиской — способы оплаты",
    width: 3456,
    height: 2048,
  },
  {
    src: withBasePath("/cases/subscribe/Платёжка.png"),
    alt: "Оформление подписки — платёжная форма",
    width: 3456,
    height: 2048,
  },
] as const satisfies ReadonlyArray<CaseImage>;

export const subscriptionPaymentScreens = [
  {
    src: withBasePath("/cases/subscribe/Оплачено.png"),
    alt: "Успешная оплата подписки",
    width: 3456,
    height: 2048,
  },
  {
    src: withBasePath("/cases/subscribe/Оплата не\u00a0прошла.png"),
    alt: "Ошибка оплаты — понятное сообщение",
    width: 3456,
    height: 2048,
  },
  {
    src: withBasePath("/cases/subscribe/Письмо.png"),
    alt: "Письмо об автосписании и условиях подписки",
    width: 3456,
    height: 2250,
    layout: "solo",
  },
] as const satisfies ReadonlyArray<CaseImage>;

export const vkCartIntroImage = [
  {
    src: withBasePath("/cases/cart/cover.png"),
    alt: "Редизайн корзины VK Маркет — обложка кейса",
    width: 1920,
    height: 1080,
    layout: "solo",
  },
] as const satisfies ReadonlyArray<CaseImage>;

export const vkCartScreens = [
  {
    src: withBasePath("/cases/cart/003.png"),
    alt: "Корзина VK Маркет — экран 1",
    width: 2880,
    height: 2744,
  },
  {
    src: withBasePath("/cases/cart/004.png"),
    alt: "Корзина VK Маркет — экран 2",
    width: 2880,
    height: 2524,
  },
  {
    src: withBasePath("/cases/cart/005.png"),
    alt: "Корзина VK Маркет — экран 3",
    width: 2880,
    height: 4428,
    layout: "solo",
  },
] as const satisfies ReadonlyArray<CaseImage>;

export function CaseFigmaPrototype({
  title,
  prototypeUrl,
}: {
  title: string;
  prototypeUrl: string;
}) {
  const embedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(prototypeUrl)}`;

  return (
    <section className="case-section mx-auto flex w-full flex-col gap-4">
      <h2>{title}</h2>
      <div className="case-figma-embed overflow-hidden rounded-2xl border border-white/12 bg-white/6">
        <iframe
          title={title}
          src={embedUrl}
          className="case-figma-embed__frame"
          allowFullScreen
        />
      </div>
      <a
        href={prototypeUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-fit items-center gap-1.5 rounded-sm text-base font-semibold leading-6 tracking-[-0.2px] text-white/86 underline decoration-white/35 underline-offset-2 transition hover:text-white hover:decoration-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
      >
        Открыть прототип в Figma
      </a>
    </section>
  );
}

export function useCaseImageLightbox(images: ReadonlyArray<CaseImage>) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isLightboxClosing, setIsLightboxClosing] = useState(false);
  const lightboxCloseTimeoutRef = useRef<number | null>(null);
  const lightboxIndexRef = useRef<number | null>(null);
  const isLightboxClosingRef = useRef(false);

  lightboxIndexRef.current = lightboxIndex;
  isLightboxClosingRef.current = isLightboxClosing;

  useEffect(() => {
    return () => {
      if (lightboxCloseTimeoutRef.current) {
        window.clearTimeout(lightboxCloseTimeoutRef.current);
      }
    };
  }, []);

  const openLightbox = useCallback(
    (image: CaseImage) => {
      const index = images.findIndex((item) => item.src === image.src);
      if (index === -1) {
        return;
      }

      if (lightboxCloseTimeoutRef.current) {
        window.clearTimeout(lightboxCloseTimeoutRef.current);
        lightboxCloseTimeoutRef.current = null;
      }

      setIsLightboxClosing(false);
      setLightboxIndex(index);
    },
    [images],
  );

  const closeLightbox = useCallback(() => {
    if (lightboxIndexRef.current === null || isLightboxClosingRef.current) {
      return;
    }

    setIsLightboxClosing(true);
    lightboxCloseTimeoutRef.current = window.setTimeout(() => {
      setLightboxIndex(null);
      setIsLightboxClosing(false);
      lightboxCloseTimeoutRef.current = null;
    }, CASE_LIGHTBOX_ANIMATION_MS);
  }, []);

  const changeLightboxIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= images.length) {
        return;
      }

      if (lightboxCloseTimeoutRef.current) {
        window.clearTimeout(lightboxCloseTimeoutRef.current);
        lightboxCloseTimeoutRef.current = null;
      }

      setIsLightboxClosing(false);
      setLightboxIndex(index);
    },
    [images.length],
  );

  const lightboxPortal: ReactPortal | null =
    lightboxIndex !== null
      ? createPortal(
          <CaseImageLightbox
            images={images}
            index={lightboxIndex}
            isClosing={isLightboxClosing}
            onClose={closeLightbox}
            onIndexChange={changeLightboxIndex}
          />,
          document.body,
        )
      : null;

  return { openLightbox, lightboxPortal };
}

export function CaseImageLightbox({
  images,
  index,
  isClosing,
  onClose,
  onIndexChange,
}: {
  images: ReadonlyArray<CaseImage>;
  index: number;
  isClosing: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const image = images[index];
  const { isReady, markReady, bindMediaRef } = useMediaReady(image.src);
  const shouldPlayOpenAnimationRef = useRef(true);
  const { bindSwipeHandlers } = useLightboxGalleryNavigation({
    itemCount: images.length,
    currentIndex: index,
    onIndexChange,
    onClose,
    isEnabled: !isClosing,
  });

  useEffect(() => {
    shouldPlayOpenAnimationRef.current = false;
  }, [index]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className={`case-image-lightbox ${
        isClosing
          ? "case-image-lightbox--closing"
          : "case-image-lightbox--opening"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={
        images.length > 1
          ? `${image.alt} (${index + 1} из ${images.length})`
          : image.alt
      }
      onClick={onClose}
    >
      <div className="case-image-lightbox__frame" {...bindSwipeHandlers()}>
        {!isReady ? (
          <MediaSkeleton
            className="pointer-events-none absolute left-1/2 top-1/2 max-h-[88dvh] w-[min(92dvw,960px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl"
            style={{ aspectRatio: `${image.width} / ${image.height}` }}
          />
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={image.src}
          ref={bindMediaRef}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className={`case-image-lightbox__image ${
            isReady ? "media-loaded" : "media-loading"
          } ${
            isClosing
              ? "case-image-lightbox__image--closing"
              : shouldPlayOpenAnimationRef.current
                ? "case-image-lightbox__image--opening"
                : ""
          }`}
          onLoad={markReady}
          onError={markReady}
          onClick={(event) => event.stopPropagation()}
        />
      </div>
      <button
        type="button"
        aria-label="Закрыть просмотр изображения"
        className="case-image-lightbox__close grid size-10 place-items-center rounded-full bg-white/10 text-white/90 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        <X aria-hidden="true" className="size-5" strokeWidth={2.2} />
      </button>
    </div>
  );
}

type CursorPosition = {
  x: number;
  y: number;
};

const CASE_CURSOR_TOOLTIP_OFFSET = 18;
const CASE_CURSOR_TOOLTIP_LERP = 0.18;

export function CaseCursorTooltip({
  text,
  position,
}: {
  text: string;
  position: CursorPosition;
}) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(position);
  const currentRef = useRef(position);
  const frameRef = useRef<number | null>(null);

  targetRef.current = position;

  useLayoutEffect(() => {
    currentRef.current = { ...position };

    const tooltip = tooltipRef.current;
    if (!tooltip) {
      return;
    }

    tooltip.style.transform = `translate3d(${position.x + CASE_CURSOR_TOOLTIP_OFFSET}px, ${position.y + CASE_CURSOR_TOOLTIP_OFFSET}px, 0)`;
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const animate = () => {
      const tooltip = tooltipRef.current;
      if (tooltip) {
        const target = targetRef.current;
        const current = currentRef.current;

        if (prefersReducedMotion) {
          current.x = target.x;
          current.y = target.y;
        } else {
          current.x += (target.x - current.x) * CASE_CURSOR_TOOLTIP_LERP;
          current.y += (target.y - current.y) * CASE_CURSOR_TOOLTIP_LERP;
        }

        tooltip.style.transform = `translate3d(${current.x + CASE_CURSOR_TOOLTIP_OFFSET}px, ${current.y + CASE_CURSOR_TOOLTIP_OFFSET}px, 0)`;
      }

      frameRef.current = window.requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={tooltipRef}
      className="case-cursor-tooltip"
      role="tooltip"
    >
      {text}
    </div>,
    document.body,
  );
}

export function CaseGridImage({
  image,
  onOpen,
  appearDelay = 0,
  cursorTooltip = false,
}: {
  image: CaseImage;
  onOpen: (image: CaseImage) => void;
  appearDelay?: number;
  cursorTooltip?: boolean;
}) {
  const { isReady, markReady, bindMediaRef } = useMediaReady(image.src);
  const [canUseCursorTooltip, setCanUseCursorTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<CursorPosition | null>(
    null,
  );
  const showCursorTooltip =
    cursorTooltip && Boolean(image.caption) && canUseCursorTooltip;

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanUseCursorTooltip(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!showCursorTooltip) {
        return;
      }

      setTooltipPosition({
        x: event.clientX,
        y: event.clientY,
      });
    },
    [showCursorTooltip],
  );

  const handlePointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!showCursorTooltip) {
        return;
      }

      setTooltipPosition({
        x: event.clientX,
        y: event.clientY,
      });
    },
    [showCursorTooltip],
  );

  const handlePointerLeave = useCallback(() => {
    setTooltipPosition(null);
  }, []);

  return (
    <figure className="flex w-full flex-col">
      <button
        type="button"
        className="case-zoomable-image relative overflow-hidden rounded-2xl bg-white/10"
        style={{
          aspectRatio: `${image.width} / ${image.height}`,
          "--image-appear-delay": `${appearDelay}ms`,
        } as CSSProperties}
        onClick={() => onOpen(image)}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        aria-label={`Открыть на весь экран: ${image.alt}`}
      >
        {!isReady ? (
          <MediaSkeleton className="absolute inset-0 rounded-[inherit]" />
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={bindMediaRef}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          decoding="async"
          loading="lazy"
          className={isReady ? "media-loaded" : "media-loading"}
          onLoad={markReady}
          onError={markReady}
        />
      </button>
      {showCursorTooltip && tooltipPosition && image.caption ? (
        <CaseCursorTooltip text={image.caption} position={tooltipPosition} />
      ) : null}
      {image.caption && !cursorTooltip ? (
        <figcaption className="case-image-caption text-center text-sm font-normal leading-5 tracking-[-0.1px] text-white/72">
          {image.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function CaseImageGrid({
  images,
  cursorTooltip = false,
}: {
  images: ReadonlyArray<CaseImage>;
  cursorTooltip?: boolean;
}) {
  const { openLightbox, lightboxPortal } = useCaseImageLightbox(images);
  const groups = groupCaseImages(images);

  return (
    <>
      <div className="case-image-grid mx-auto flex w-full flex-col">
        {groups.map((group, groupIndex) => (
          <div
            key={`${group.type}-${groupIndex}`}
            className={
              group.type === "portrait"
                ? "case-image-grid__portrait"
                : "case-image-grid__landscape"
            }
          >
            {group.images.map((image, imageIndex) => (
              <CaseGridImage
                key={image.src}
                image={image}
                appearDelay={(groupIndex * 3 + imageIndex) * 45}
                cursorTooltip={cursorTooltip}
                onOpen={openLightbox}
              />
            ))}
          </div>
        ))}
      </div>
      {lightboxPortal}
    </>
  );
}

export function CaseIntro({ children }: { children: ReactNode }) {
  return (
    <section className="case-intro case-section mx-auto flex w-full flex-col gap-4">
      {children}
    </section>
  );
}

export function CaseSection({
  title,
  heading = "h2",
  id,
  children,
}: {
  title: string;
  heading?: "h2" | "h3";
  id?: string;
  children: ReactNode;
}) {
  const TitleTag = heading;

  return (
    <section
      id={id}
      className="case-section mx-auto flex w-full flex-col gap-4"
    >
      <TitleTag>{title}</TitleTag>
      {children}
    </section>
  );
}

const caseScrollJumpButtonClassName =
  "case-scroll-jump inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-base font-semibold leading-6 tracking-[-0.2px] text-[#fafafa] transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

export function CaseScrollJumpButton({
  scrollContainerRef,
  targetId,
  label,
}: {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  targetId: string;
  label: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      return;
    }

    const updateVisibility = () => {
      const target = scrollContainer.querySelector<HTMLElement>(`#${targetId}`);
      if (!target) {
        setIsVisible(false);
        return;
      }

      const containerRect = scrollContainer.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      setIsVisible(targetRect.top > containerRect.bottom - 96);
    };

    updateVisibility();
    scrollContainer.addEventListener("scroll", updateVisibility, {
      passive: true,
    });
    window.addEventListener("resize", updateVisibility);

    return () => {
      scrollContainer.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, [scrollContainerRef, targetId]);

  const scrollToTarget = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    const target = scrollContainer?.querySelector<HTMLElement>(`#${targetId}`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [scrollContainerRef, targetId]);

  return (
    <button
      type="button"
      className={`${caseScrollJumpButtonClassName} absolute bottom-4 left-1/2 z-10 ${
        isVisible ? "case-scroll-jump--visible" : "pointer-events-none"
      }`}
      onClick={scrollToTarget}
      onPointerDown={(event) => event.stopPropagation()}
      tabIndex={isVisible ? 0 : -1}
      aria-hidden={!isVisible}
    >
      {label}
      <ChevronDown aria-hidden className="size-4 shrink-0" strokeWidth={2.25} />
    </button>
  );
}


export function ProfileAvatar({
  size = "sm",
  priority = false,
}: {
  size?: "sm" | "md";
  priority?: boolean;
}) {
  const { openLightbox, lightboxPortal } = useCaseImageLightbox(profileAvatarGallery);
  const { isReady, markReady, bindMediaRef } = useMediaReady(
    profileAvatarImage.src,
  );
  const sizeClass =
    size === "sm" ? "size-14 min-[901px]:size-16" : "size-20";
  const imageSizes = size === "sm" ? "(max-width: 900px) 56px, 64px" : "80px";

  return (
    <>
      <button
        type="button"
        className={`relative ${sizeClass} shrink-0 cursor-zoom-in overflow-hidden rounded-full bg-white transition hover:ring-2 hover:ring-white/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70`}
        onClick={() => openLightbox(profileAvatarImage)}
        onPointerDown={(event) => event.stopPropagation()}
        aria-label="Открыть фото на весь экран"
      >
        {!isReady ? (
          <MediaSkeleton className="absolute inset-0 rounded-full" />
        ) : null}
        <Image
          ref={bindMediaRef}
          src={profileAvatarImage.src}
          alt={profileAvatarImage.alt}
          fill
          priority={priority}
          sizes={imageSizes}
          className={`object-cover ${isReady ? "media-loaded" : "media-loading"}`}
          onLoad={markReady}
        />
      </button>
      {lightboxPortal}
    </>
  );
}