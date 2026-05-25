export const siteConfig = {
  name: "Родион Плехов",
  title: "Родион Плехов — продуктовый дизайнер",
  description:
    "Портфолио продуктового дизайнера: кейсы для СберОбразования, VK Маркет и EdTech — исследования, UX/UI, метрики и результаты.",
  locale: "ru_RU",
  keywords: [
    "продуктовый дизайнер",
    "UX дизайн",
    "UI дизайн",
    "портфолио дизайнера",
    "СберОбразование",
    "EdTech",
    "VK Маркет",
    "Лаборатория заданий",
    "Родион Плехов",
  ],
  author: "Родион Плехов",
  telegram: "https://t.me/r_plekhov",
  behance: "https://www.behance.net/plekhovrodion",
  employer: "https://sbereducation.ru/",
  ogImage: "/figma-profile-avatar.jpeg",
} as const;

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
