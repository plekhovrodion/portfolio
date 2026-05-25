import type { Metadata } from "next";
import { YandexMetrika } from "@/components/yandex-metrika";
import { getSiteUrl, siteConfig } from "@/lib/site";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.author, url: siteConfig.behance }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  category: "design",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteUrl,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 512,
        height: 512,
        alt: `${siteConfig.name} — дизайнер интерфейсов`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: [{ url: "/figma-profile-avatar.jpeg", type: "image/jpeg" }],
    apple: "/figma-profile-avatar.jpeg",
  },
};

const portfolioJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: siteConfig.name,
      description: siteConfig.description,
      url: siteUrl,
      inLanguage: "ru-RU",
    },
    {
      "@type": "Person",
      name: siteConfig.name,
      jobTitle: "Дизайнер интерфейсов",
      description: siteConfig.description,
      url: siteUrl,
      image: `${siteUrl}${siteConfig.ogImage}`,
      sameAs: [siteConfig.telegram, siteConfig.behance, siteConfig.employer],
      worksFor: {
        "@type": "Organization",
        name: "СберОбразование",
        url: siteConfig.employer,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(portfolioJsonLd),
          }}
        />
        {children}
        <YandexMetrika />
      </body>
    </html>
  );
}
