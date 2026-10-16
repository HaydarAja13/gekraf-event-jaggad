function IconChart() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 19V5M4 19h16"
        stroke="#051226"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 15v-4M12 15V8M16 15v-7"
        stroke="#051226"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="3" stroke="#051226" strokeWidth="1.8" />
      <path
        d="M3.5 18c.6-2.5 2.6-4 5.5-4s4.9 1.5 5.5 4"
        stroke="#051226"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="17" cy="9" r="2.5" stroke="#051226" strokeWidth="1.8" />
      <path
        d="M16 14c2 .3 3.5 1.4 4 3.5"
        stroke="#051226"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconHandshake() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 12l2.2 2.2a2 2 0 002.8 0L16 11l1.5 1.5a2 2 0 002.8 0L22 11"
        stroke="#051226"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12l3-3 2.5 1.5M14 8l2-2 4 2"
        stroke="#051226"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTrend() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 18l6-6 3.5 3.5L20 7"
        stroke="#051226"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 7h6v6"
        stroke="#051226"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const cards = [
  {
    icon: <IconChart />,
    title: "Omset stagnan",
    caption: "meskipun sudah iklan dan banyak konten",
  },
  {
    icon: <IconUsers />,
    title: "Tim kurang produktif",
    caption: "dan semua keputusan bergantung pada pemilik",
  },
  {
    icon: <IconHandshake />,
    title: "Brand sulit dibedakan",
    caption: "dengan kompetitor dan sering terjebak perang harga",
  },
  {
    icon: <IconTrend />,
    title: "Bingung strategi",
    caption: "untuk mengembangkan bisnis ke level berikutnya",
  },
];

export default function PainPoints() {
  return (
    <section id="tentang" className="bg-gekraf-surface">
      <div className="mx-auto w-[min(90%,1440px)] px-5 sm:px-8 lg:px-12 grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14 lg:py-20">
        <div className="animate-fade-up">
          <span className="inline-flex rounded-full bg-gekraf-gold px-4 py-1.5 text-[16px] font-bold tracking-[0.14em] text-gekraf-ink uppercase">
            Kenali Situasinya
          </span>
          <h2 className="mt-5 text-[clamp(1.975rem,3.6vw,2.625rem)] leading-[1.2] font-extrabold text-gekraf-ink">
            Apakah Anda Mengalami
            <br />
            Hal yang Sama?
          </h2>
          <p className="mt-4 max-w-md text-[18px] leading-relaxed text-gekraf-muted">
            Banyak bisnis tumbuh, tapi pemilik tetap merasa kewalahan. Mungkin
            Anda juga merasakan:
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <article
              key={c.title}
              className="flex items-center gap-4 rounded-2xl bg-white px-5 py-5 shadow-[0_4px_24px_rgba(15,23,42,0.06)]"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gekraf-gold">
                {c.icon}
              </span>
              <div className="min-w-0">
                <p className="text-[18px] leading-snug font-bold text-gekraf-ink">
                  {c.title}
                </p>
                <p className="mt-0.5 text-[18px] leading-snug text-gekraf-muted">
                  {c.caption}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
