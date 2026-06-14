"use client";

import { portfolioFigmaUrl, type CaseMetaBrand } from "@/lib/case-data";
import { withBasePath } from "@/lib/site";

export type { CaseMetaBrand };

const figmaLogoSrc = withBasePath("/figma.svg");

const caseMetaLinkClassName =
  "inline-flex items-center gap-1 rounded-sm underline decoration-white/35 underline-offset-2 transition hover:text-white/80 hover:decoration-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

const caseMetaLogoClassName = "size-5 shrink-0 object-contain";

export function CaseMetaBrandValue({ brand }: { brand: CaseMetaBrand }) {
  const content = (
    <>
      {brand.logoSrc ? (
        <img
          src={brand.logoSrc}
          alt=""
          aria-hidden="true"
          className={caseMetaLogoClassName}
        />
      ) : null}
      <span>{brand.name}</span>
    </>
  );

  if (brand.href) {
    return (
      <a
        href={brand.href}
        target="_blank"
        rel="noreferrer"
        className={caseMetaLinkClassName}
        onPointerDown={(event) => event.stopPropagation()}
      >
        {content}
      </a>
    );
  }

  return <span className="inline-flex max-w-full items-center gap-1">{content}</span>;
}

export function CaseMeta({
  product,
  role = "Продуктовый дизайнер",
  year,
}: {
  product: CaseMetaBrand;
  role?: string;
  year: string;
}) {
  return (
    <dl className="case-meta case-body">
      <div className="case-meta__row">
        <dt className="case-meta__label">Продукт</dt>
        <dd className="case-meta__value">
          <CaseMetaBrandValue brand={product} />
        </dd>
      </div>

      <div className="case-meta__row">
        <dt className="case-meta__label">Роль</dt>
        <dd className="case-meta__value">{role}</dd>
      </div>

      <div className="case-meta__row">
        <dt className="case-meta__label">Год</dt>
        <dd className="case-meta__value">{year}</dd>
      </div>

      <div className="case-meta__row">
        <dt className="case-meta__label">Макеты</dt>
        <dd className="case-meta__value">
          <a
            href={portfolioFigmaUrl}
            target="_blank"
            rel="noreferrer"
            className={caseMetaLinkClassName}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <img
              src={figmaLogoSrc}
              alt=""
              aria-hidden="true"
              className={caseMetaLogoClassName}
            />
            <span>Figma</span>
          </a>
        </dd>
      </div>
    </dl>
  );
}
