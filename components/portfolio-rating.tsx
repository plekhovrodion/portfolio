"use client";

import {
  getPortfolioVisitorId,
  submitPortfolioRating,
} from "@/lib/portfolio-ratings";
import { CircleCheck, Star, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";

const STORAGE_KEY = "portfolio-rating";
const DISMISS_KEY = "portfolio-rating-dismissed";
const RATING_CHANGE_EVENT = "portfolio-rating-change";
const RATING_DISMISS_EVENT = "portfolio-rating-dismiss-change";
const RATING_WINDOW_DELAY_MS = 5_000;
const RATING_THANKS_MS = 1_600;
const RATING_CLOSE_ANIMATION_MS = 220;

export function readPortfolioRating(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }

  const value = Number(stored);
  return value >= 1 && value <= 5 ? value : null;
}

function subscribeToPortfolioRating(onStoreChange: () => void) {
  window.addEventListener(RATING_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(RATING_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function notifyPortfolioRatingChange() {
  window.dispatchEvent(new Event(RATING_CHANGE_EVENT));
}

function readPortfolioRatingDismissed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(DISMISS_KEY) === "1";
}

function subscribeToPortfolioRatingDismiss(onStoreChange: () => void) {
  window.addEventListener(RATING_DISMISS_EVENT, onStoreChange);

  return () => {
    window.removeEventListener(RATING_DISMISS_EVENT, onStoreChange);
  };
}

function notifyPortfolioRatingDismissChange() {
  window.dispatchEvent(new Event(RATING_DISMISS_EVENT));
}

function StarRow({
  value,
  hoverValue,
  onHover,
  onSelect,
}: {
  value: number;
  hoverValue: number;
  onHover: (value: number) => void;
  onSelect: (value: number) => void;
}) {
  const activeValue = hoverValue || value;

  return (
    <div
      className="portfolio-rating__stars"
      role="radiogroup"
      aria-label="Оценка от 1 до 5 звёзд"
      onMouseLeave={() => onHover(0)}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= activeValue;

        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            aria-label={`${starValue} из 5`}
            className="portfolio-rating__star portfolio-rating__star--lg"
            style={{ "--star-index": index } as CSSProperties}
            onMouseEnter={() => onHover(starValue)}
            onFocus={() => onHover(starValue)}
            onBlur={() => onHover(0)}
            onClick={() => onSelect(starValue)}
          >
            <Star
              aria-hidden="true"
              className={isFilled ? "portfolio-rating__star-icon--filled" : ""}
              fill={isFilled ? "currentColor" : "none"}
              strokeWidth={isFilled ? 0 : 2}
            />
          </button>
        );
      })}
    </div>
  );
}

export function PortfolioRatingWindow({
  isOpen,
  onClose,
  onRate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onRate: (rating: number) => void;
}) {
  const [hoverValue, setHoverValue] = useState(0);
  const [phase, setPhase] = useState<"rating" | "thanks">("rating");
  const [isClosing, setIsClosing] = useState(false);
  const thanksTimeoutRef = useRef<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (thanksTimeoutRef.current) {
        window.clearTimeout(thanksTimeoutRef.current);
      }

      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  function clearTimers() {
    if (thanksTimeoutRef.current) {
      window.clearTimeout(thanksTimeoutRef.current);
      thanksTimeoutRef.current = null;
    }

    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }

  function handleClose() {
    clearTimers();
    setIsClosing(true);

    closeTimeoutRef.current = window.setTimeout(() => {
      setPhase("rating");
      setHoverValue(0);
      setIsClosing(false);
      onClose();
      closeTimeoutRef.current = null;
    }, RATING_CLOSE_ANIMATION_MS);
  }

  function handleSelect(value: number) {
    if (phase === "thanks") {
      return;
    }

    setPhase("thanks");
    clearTimers();

    thanksTimeoutRef.current = window.setTimeout(() => {
      setIsClosing(true);

      closeTimeoutRef.current = window.setTimeout(() => {
        onRate(value);
        setPhase("rating");
        setHoverValue(0);
        setIsClosing(false);
        onClose();
        closeTimeoutRef.current = null;
      }, RATING_CLOSE_ANIMATION_MS);

      thanksTimeoutRef.current = null;
    }, RATING_THANKS_MS);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <article
      className={`portfolio-rating-window ${
        phase === "thanks" ? "portfolio-rating-window--thanks" : ""
      } ${isClosing ? "portfolio-rating-window--closing" : ""}`}
      role="dialog"
      aria-modal="false"
      aria-labelledby="portfolio-rating-title"
      style={{ "--appear-delay": "0ms" } as CSSProperties}
    >
      {phase === "rating" ? (
        <>
          <header className="portfolio-rating-window__header">
            <p
              id="portfolio-rating-title"
              className="portfolio-rating-window__title"
            >
              Оцените портфолио
            </p>
            <button
              type="button"
              className="portfolio-rating-window__close"
              aria-label="Закрыть"
              onClick={handleClose}
            >
              <X aria-hidden="true" className="size-4" strokeWidth={2.2} />
            </button>
          </header>
          <div className="portfolio-rating-window__body portfolio-rating-window__body--rating">
            <StarRow
              value={0}
              hoverValue={hoverValue}
              onHover={setHoverValue}
              onSelect={handleSelect}
            />
          </div>
        </>
      ) : (
        <div
          className="portfolio-rating-thanks"
          aria-live="polite"
        >
          <div className="portfolio-rating-thanks__check" aria-hidden="true">
            <CircleCheck className="portfolio-rating-thanks__check-icon" />
          </div>
          <p id="portfolio-rating-title" className="portfolio-rating-thanks__text">
            Спасибо за оценку
          </p>
        </div>
      )}
    </article>
  );
}

export function usePortfolioRating(isSiteInteractive: boolean) {
  const rating = useSyncExternalStore(
    subscribeToPortfolioRating,
    readPortfolioRating,
    () => null,
  );
  const isDismissed = useSyncExternalStore(
    subscribeToPortfolioRatingDismiss,
    readPortfolioRatingDismissed,
    () => false,
  );
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [canShowWindow, setCanShowWindow] = useState(false);

  useEffect(() => {
    if (!isSiteInteractive) {
      const resetId = window.setTimeout(() => {
        setCanShowWindow(false);
      }, 0);

      return () => {
        window.clearTimeout(resetId);
      };
    }

    const timeoutId = window.setTimeout(() => {
      setCanShowWindow(true);
    }, RATING_WINDOW_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isSiteInteractive]);

  const isWindowOpen =
    isClient &&
    isSiteInteractive &&
    rating === null &&
    !isDismissed &&
    canShowWindow;

  async function saveRating(rating: number) {
    window.localStorage.setItem(STORAGE_KEY, String(rating));
    window.sessionStorage.removeItem(DISMISS_KEY);
    notifyPortfolioRatingChange();
    notifyPortfolioRatingDismissChange();

    try {
      await submitPortfolioRating({
        rating,
        visitorId: getPortfolioVisitorId(),
        page: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      console.error("Failed to submit portfolio rating", error);
    }
  }

  function closeRatingWindow() {
    window.sessionStorage.setItem(DISMISS_KEY, "1");
    notifyPortfolioRatingDismissChange();
  }

  return {
    rating,
    isWindowOpen,
    isReady: isClient,
    saveRating,
    closeRatingWindow,
  };
}
