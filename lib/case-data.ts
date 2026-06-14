import { withBasePath } from "@/lib/site";

export type DesktopFile = {
  id: string;
  label: string;
  x: number;
  y: number;
  variant?: "folder";
};

export type Position = {
  x: number;
  y: number;
};

export type DragTarget =
  | { type: "file"; id: string }
  | { type: "card" }
  | { type: "case-window" };

export type DragState = {
  target: DragTarget;
  offsetX: number;
  offsetY: number;
  startX: number;
  startY: number;
  width: number;
  height: number;
  hasMoved: boolean;
};

export type StageSize = {
  width: number;
  height: number;
};

export type CaseMetaBrand = {
  name: string;
  href?: string;
  logoSrc?: string;
  logoAlt?: string;
};

export type AboutMeHighlight = {
  title: string;
  description: string;
  href?: string;
};

export const MUSIC_BACKGROUND_VIDEO = withBasePath(
  "/dancing-rat-chess-type-beat.webm",
);
export const CV_PDF = withBasePath("/cv.pdf");

export const portfolioFigmaUrl =
  "https://www.figma.com/design/ktT6r8F9iATFV50G7yt4ag/%D0%9F%D0%BE%D1%80%D1%82%D1%84%D0%BE%D0%BB%D0%B8%D0%BE?node-id=3026-51835";

export const vkCartFigmaPrototype =
  "https://www.figma.com/proto/1C93yxYA4hkGBogyImvYgE/%D0%A2%D0%B5%D1%81%D1%82%D0%BE%D0%B2%D0%BE%D0%B5-%D0%B7%D0%B0%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5-VK-%D0%9C%D0%B0%D1%80%D0%BA%D0%B5%D1%82-%D0%9A%D0%BE%D1%80%D0%B7%D0%B8%D0%BD%D0%B0-%C2%B7-%D0%9F%D0%BB%D0%B5%D1%85%D0%BE%D0%B2-%D0%A0%D0%BE%D0%B4%D0%B8%D0%BE%D0%BD?node-id=2-8527&viewport=-7125%2C68%2C0.66&scaling=scale-down&starting-point-node-id=2%3A8527&show-proto-sidebar=1&page-id=0%3A1";

export const inlineLinkClassName =
  "rounded-sm underline decoration-white/35 underline-offset-2 transition hover:text-white/80 hover:decoration-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

const labProductLogoSrc = withBasePath(
  "/logos/products/laboratoriya-zadaniy.svg",
);
const assistantProductLogoSrc = withBasePath(
  "/logos/products/assistient-prepodavatelya.svg",
);
const vkLogoSrc = withBasePath("/logos/companies/vk.svg");

export const labProductBrand: CaseMetaBrand = {
  name: "Лаборатория заданий",
  href: "https://edu-assist.ru/",
  logoSrc: labProductLogoSrc,
  logoAlt: "Лаборатория заданий",
};

export const assistantProductBrand: CaseMetaBrand = {
  name: "Ассистент преподавателя",
  href: "https://edu-assist.me/promo",
  logoSrc: assistantProductLogoSrc,
  logoAlt: "Ассистент преподавателя",
};

export const vkMarketProductBrand: CaseMetaBrand = {
  name: "VK Маркет",
  href: "https://vk.com/market",
  logoSrc: vkLogoSrc,
  logoAlt: "VK Маркет",
};

export const profileProductBrand: CaseMetaBrand = {
  name: "Единый профиль",
  href: "https://app.edu-assist.me/profile",
};

export const desktopFilePreviews: Partial<Record<string, string>> = {
  home: withBasePath("/desktop-previews/home.webp"),
  classes: withBasePath("/desktop-previews/classes.webp"),
  profile: withBasePath("/desktop-previews/profile.webp"),
  "ai-assistant": withBasePath("/desktop-previews/ai-assistant.webp"),
  subscription: withBasePath("/desktop-previews/subscription.webp"),
  "vk-cart": withBasePath("/desktop-previews/vk-cart.webp"),
};

export const caseWindowTitles: Record<string, string> = {
  "about-me": "Обо мне",
  motion: "Моушн",
  home: "Главная страница",
  profile: "Единый профиль",
  classes: "Статистика занятий",
  "ai-assistant": "ИИ-помощник",
  subscription: "Тарифы",
  "vk-cart": "Корзина — тестовое задание",
  "assistant-promo": "Промо",
};

export const aboutMeProductHighlights: ReadonlyArray<AboutMeHighlight> = [
  {
    title: "Ассистент преподавателя (2023–2026)",
    description: "150к+ пользователей, 57 регионов РФ",
    href: "https://edu-assist.me/promo",
  },
  {
    title: "Единый профиль СберОбразования (2023–2024)",
    description: "350к+ пользователей",
    href: "https://app.edu-assist.me/profile",
  },
  {
    title: "Лаборатория заданий (2025)",
    description: "1000+ платящих после запуска подписок",
    href: "https://edu-assist.ru/",
  },
  {
    title: "UI Kit (2026)",
    description: "темизация, покрытие 90% сценариев",
  },
  {
    title: "ИИ-помощник (2026)",
    description: "20к+ чатов",
    href: "https://app.edu-assist.me/ai",
  },
];

export const aboutMeTeamHighlights: ReadonlyArray<AboutMeHighlight> = [
  {
    title: "Исследования",
    description:
      "внедрил немодерируемые исследования через PathWay (команда 10+ чел.)",
  },
  {
    title: "Менторство",
    description: "обучаю стажёров: курс по дизайну, митапы по Cursor",
  },
  {
    title: "Процессы",
    description: "создал чек‑лист проверки макетов и шаблон сценариев",
  },
];

export const desktopFiles: DesktopFile[] = [
  { id: "home", label: "Главная", x: 289, y: 154 },
  { id: "classes", label: "Статистика занятий", x: 804, y: 190 },
  { id: "ai-assistant", label: "ИИ-помощник", x: 548, y: 480 },
  { id: "subscription", label: "Тарифы", x: 261, y: 584 },
  { id: "vk-cart", label: "Корзина", x: 613, y: 831 },
  { id: "profile", label: "Профиль", x: 1087, y: 716 },
  { id: "motion", label: "Моушн", x: 437, y: 328, variant: "folder" },
];
