export function ProfileCardHero() {
  return (
    <>
      <h1>Родион Плехов</h1>
      <p className="text-base font-normal leading-6 tracking-[-0.2px]">
        Привет! Я — дизайнер интерфейсов, работаю в{" "}
        <a
          href="https://sbereducation.ru/"
          target="_blank"
          rel="noreferrer"
          className="rounded-sm underline decoration-white/35 underline-offset-2 transition hover:text-white/80 hover:decoration-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
        >
          СберОбразовании
        </a>{" "}
        Более 4 лет разрабатываю B2C и B2B системы, сервисы и приложения
      </p>
    </>
  );
}
