"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  fetchPortfolioRatings,
  getPortfolioRatingStats,
  isPortfolioRatingApiConfigured,
  type PortfolioRatingRecord,
} from "@/lib/portfolio-ratings";

const ADMIN_KEY_STORAGE = "portfolio-rating-admin-key";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function Stars({ value }: { value: number }) {
  return (
    <span className="ratings-admin__stars" aria-label={`${value} из 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={
            index < value ? "ratings-admin__star ratings-admin__star--filled" : ""
          }
          fill={index < value ? "currentColor" : "none"}
          strokeWidth={index < value ? 0 : 2}
        />
      ))}
    </span>
  );
}

export default function RatingsAdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [records, setRecords] = useState<PortfolioRatingRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const stats = useMemo(() => {
    if (!records) {
      return null;
    }

    return getPortfolioRatingStats(records);
  }, [records]);

  const isConfigured = isPortfolioRatingApiConfigured();

  useEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.style.overflow = "auto";
    body.style.overflow = "auto";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, []);

  async function loadRatings(key: string) {
    setIsLoading(true);
    setError(null);

    try {
      const nextRecords = await fetchPortfolioRatings(key);
      setRecords(nextRecords);
      setSavedKey(key);
      window.sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
    } catch (loadError) {
      setRecords(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить оценки",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadRatings(adminKey.trim());
  }

  function handleUseSavedKey() {
    const key = window.sessionStorage.getItem(ADMIN_KEY_STORAGE);

    if (!key) {
      return;
    }

    setAdminKey(key);
    void loadRatings(key);
  }

  return (
    <main className="ratings-admin">
      <div className="ratings-admin__shell">
        <header className="ratings-admin__header">
          <div>
            <p className="ratings-admin__eyebrow">Портфолио</p>
            <h1>Оценки посетителей</h1>
          </div>
          <Link href="/" className="ratings-admin__back">
            На сайт
          </Link>
        </header>

        {!isConfigured ? (
          <section className="ratings-admin__panel">
            <h2>API не настроен</h2>
            <p>
              Добавьте URL Google Apps Script в{" "}
              <code>NEXT_PUBLIC_RATING_API_URL</code> и пересоберите сайт.
              Инструкция — в файле{" "}
              <code>docs/portfolio-ratings.md</code>.
            </p>
          </section>
        ) : (
          <>
            <form className="ratings-admin__panel" onSubmit={handleSubmit}>
              <label className="ratings-admin__label" htmlFor="admin-key">
                Ключ администратора
              </label>
              <div className="ratings-admin__controls">
                <input
                  id="admin-key"
                  type="password"
                  autoComplete="current-password"
                  className="ratings-admin__input"
                  value={adminKey}
                  onChange={(event) => setAdminKey(event.target.value)}
                  placeholder="ADMIN_KEY из Apps Script"
                />
                <button
                  type="submit"
                  className="ratings-admin__button"
                  disabled={isLoading || adminKey.trim().length === 0}
                >
                  {isLoading ? "Загрузка…" : "Показать"}
                </button>
                <button
                  type="button"
                  className="ratings-admin__button ratings-admin__button--ghost"
                  onClick={handleUseSavedKey}
                  disabled={isLoading}
                >
                  Использовать сохранённый
                </button>
              </div>
              {error ? <p className="ratings-admin__error">{error}</p> : null}
            </form>

            {stats && records ? (
              <>
                <section className="ratings-admin__stats">
                  <article className="ratings-admin__stat">
                    <p className="ratings-admin__stat-label">Всего оценок</p>
                    <p className="ratings-admin__stat-value">{stats.count}</p>
                  </article>
                  <article className="ratings-admin__stat">
                    <p className="ratings-admin__stat-label">Средняя</p>
                    <p className="ratings-admin__stat-value">
                      {stats.average || "—"}
                    </p>
                  </article>
                  <article className="ratings-admin__stat ratings-admin__stat--wide">
                    <p className="ratings-admin__stat-label">Распределение</p>
                    <div className="ratings-admin__distribution">
                      {stats.distribution.map((count, index) => (
                        <div
                          key={index}
                          className="ratings-admin__distribution-row"
                        >
                          <span>{index + 1}★</span>
                          <div className="ratings-admin__distribution-bar">
                            <span
                              style={{
                                width:
                                  stats.count === 0
                                    ? "0%"
                                    : `${(count / stats.count) * 100}%`,
                              }}
                            />
                          </div>
                          <span>{count}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                </section>

                <section className="ratings-admin__panel ratings-admin__panel--table">
                  <div className="ratings-admin__table-head">
                    <h2>Последние оценки</h2>
                    {savedKey ? (
                      <button
                        type="button"
                        className="ratings-admin__button ratings-admin__button--ghost"
                        onClick={() => void loadRatings(savedKey)}
                        disabled={isLoading}
                      >
                        Обновить
                      </button>
                    ) : null}
                  </div>

                  {records.length === 0 ? (
                    <p>Пока нет ни одной оценки.</p>
                  ) : (
                    <div className="ratings-admin__table-wrap">
                      <table className="ratings-admin__table">
                        <thead>
                          <tr>
                            <th>Когда</th>
                            <th>Оценка</th>
                            <th>Имя</th>
                            <th>ID посетителя</th>
                            <th>Страница</th>
                          </tr>
                        </thead>
                        <tbody>
                          {records.map((record, index) => (
                            <tr key={`${record.createdAt}-${index}`}>
                              <td>{formatDate(record.createdAt)}</td>
                              <td>
                                <Stars value={record.rating} />
                              </td>
                              <td>{record.name || "Аноним"}</td>
                              <td>
                                <code>{record.visitorId || "—"}</code>
                              </td>
                              <td>{record.page || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
