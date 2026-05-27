export type PortfolioRatingSubmission = {
  rating: number;
  visitorId: string;
  page: string;
  referrer: string;
  userAgent: string;
};

export type PortfolioRatingRecord = {
  createdAt: string;
  rating: number;
  name: string;
  visitorId: string;
  page: string;
  referrer: string;
  userAgent: string;
};

const VISITOR_ID_KEY = "portfolio-visitor-id";

function getRatingApiUrl() {
  return process.env.NEXT_PUBLIC_RATING_API_URL?.trim() ?? "";
}

export function isPortfolioRatingApiConfigured() {
  return getRatingApiUrl().length > 0;
}

export function getPortfolioVisitorId() {
  if (typeof window === "undefined") {
    return "server";
  }

  const existingId = window.localStorage.getItem(VISITOR_ID_KEY);
  if (existingId) {
    return existingId;
  }

  const nextId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  window.localStorage.setItem(VISITOR_ID_KEY, nextId);
  return nextId;
}

export async function submitPortfolioRating(
  submission: PortfolioRatingSubmission,
) {
  const apiUrl = getRatingApiUrl();

  if (!apiUrl) {
    return { ok: false as const, skipped: true as const };
  }

  // GET вместо POST: у Google Apps Script Web App нет CORS для POST из браузера.
  const url = new URL(apiUrl);
  url.searchParams.set("action", "submit");
  url.searchParams.set("rating", String(submission.rating));
  url.searchParams.set("visitorId", submission.visitorId);
  url.searchParams.set("page", submission.page);
  url.searchParams.set("referrer", submission.referrer);
  url.searchParams.set("userAgent", submission.userAgent);

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Rating submit failed: ${response.status}`);
  }

  const payload = (await response.json()) as { ok?: boolean };

  if (!payload.ok) {
    throw new Error("Rating submit rejected");
  }

  return { ok: true as const, skipped: false as const };
}

export async function fetchPortfolioRatings(adminKey: string) {
  const apiUrl = getRatingApiUrl();

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_RATING_API_URL is not configured");
  }

  const url = new URL(apiUrl);
  url.searchParams.set("action", "list");
  url.searchParams.set("key", adminKey);

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Rating list failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    ok?: boolean;
    records?: PortfolioRatingRecord[];
    error?: string;
  };

  if (!payload.ok || !payload.records) {
    throw new Error(payload.error ?? "Rating list rejected");
  }

  return payload.records;
}

export function getPortfolioRatingStats(records: PortfolioRatingRecord[]) {
  if (records.length === 0) {
    return {
      count: 0,
      average: 0,
      distribution: [0, 0, 0, 0, 0] as const,
    };
  }

  const distribution = [0, 0, 0, 0, 0] as [
    number,
    number,
    number,
    number,
    number,
  ];

  let total = 0;

  for (const record of records) {
    const index = Math.min(5, Math.max(1, record.rating)) - 1;
    distribution[index] += 1;
    total += record.rating;
  }

  return {
    count: records.length,
    average: Math.round((total / records.length) * 10) / 10,
    distribution,
  };
}
