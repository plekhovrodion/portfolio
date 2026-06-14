"use client";

import { CV_PDF } from "@/lib/case-data";

const aboutMeContactButtonClassName =
  "inline-flex items-center justify-center rounded-full bg-white/10 px-5 py-2.5 text-base font-semibold leading-6 tracking-[-0.2px] text-[#fafafa] transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

export function AboutMeContacts() {
  return (
    <nav
      aria-label="Контакты и портфолио"
      className="case-section mx-auto flex w-full flex-wrap items-center gap-3"
    >
      <a
        href="https://t.me/r_plekhov"
        target="_blank"
        rel="noreferrer"
        className={aboutMeContactButtonClassName}
      >
        Telegram
      </a>
      <a
        href="mailto:r_plekhov@icloud.com"
        className={aboutMeContactButtonClassName}
      >
        Почта
      </a>
      <a
        href="https://www.behance.net/plekhovrodion"
        target="_blank"
        rel="noreferrer"
        className={aboutMeContactButtonClassName}
      >
        Behance
      </a>
      <a
        href={CV_PDF}
        target="_blank"
        rel="noreferrer"
        className={aboutMeContactButtonClassName}
      >
        Резюме
      </a>
    </nav>
  );
}
