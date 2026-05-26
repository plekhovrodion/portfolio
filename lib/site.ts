export const profileBio =
  "Привет! Я — дизайнер интерфейсов, работаю в СберОбразовании. Более 4 лет разрабатываю B2C и B2B системы, сервисы и приложения.";

export function withBasePath(path: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${basePath}${path}`;
}

export const siteConfig = {
  name: "Родион Плехов",
  title: "Родион Плехов",
  description: profileBio,
  locale: "ru_RU",
  keywords: [
    "дизайнер интерфейсов",
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
  ogImage: withBasePath("/figma-profile-avatar.jpeg"),
} as const;

export const productionSiteUrl = "https://plekhovrodion.github.io/portfolio";

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NODE_ENV === "production") {
    return productionSiteUrl;
  }

  return "http://localhost:3000";
}
