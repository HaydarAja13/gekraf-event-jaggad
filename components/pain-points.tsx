const problems = [
  {
    title: "Omset stagnan",
    text: "meskipun sudah iklan dan banyak konten",
    icon: ChartIcon,
  },
  {
    title: "Tim kurang produktif",
    text: "dan semua keputusan bergantung pada pemilik",
    icon: TeamIcon,
  },
  {
    title: "Brand sulit dibedakan",
    text: "dengan kompetitor dan sering terjebak perang harga",
    icon: HandshakeIcon,
  },
  {
    title: "Bingung strategi",
    text: "untuk mengembangkan bisnis ke level berikutnya",
    icon: GrowthIcon,
  },
];

function ChartIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" aria-hidden="true">
      <path d="M6 20.5h3.2V26H6v-5.5Zm6.2-5.2h3.2V26h-3.2V15.3Zm6.2-4.6H22V26h-3.6V10.7Z" fill="currentColor" />
      <path d="M7 13.5 12.2 8l3.4 3.2L22.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.6 5H22.5v4.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" aria-hidden="true">
      <circle cx="12" cy="11" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="21" cy="12.2" r="2.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.5 24.2c.6-3.6 3.2-5.4 6.5-5.4s5.9 1.8 6.5 5.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18.2 19.2c2.2-.3 4.1.8 5 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" aria-hidden="true">
      <path
        d="M5 15.5 10.2 11l3.2 2.4 2.2-1.6L21 15.2l5.2-3.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m10.2 11 1.2 6.2 3.4 2.6 2.8-2.2 4.2 3.2M8.2 17.2l-2.4 2.2M24.6 14.4l2.6 2.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GrowthIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" aria-hidden="true">
      <path d="M6 24.5h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m7 20 5.2-5.2 4 3.4L24 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.2 9.5H24V15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PainPoints() {
  return (
    <section id="tentang" className="scroll-mt-24 bg-[#f8f7f3] text-[#071433]">
      <div className="mx-auto grid w-full max-w-[1474px] items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-x-10 lg:gap-y-10 lg:px-12 lg:py-14 xl:py-12 desk:grid-cols-[minmax(0,1fr)_660px] desk:gap-x-8 desk:py-[43px] desk:pr-[62px] desk:pl-[126px]">
        <div className="max-w-[36rem] desk:mt-3">
          <p className="inline-flex h-[34px] items-center rounded-full bg-gold px-4 text-[11px] font-bold tracking-[0.06em] text-[#141414] sm:px-6 sm:text-[12px]">
            KENALI SITUS KAMI
          </p>
          <h2 className="mt-6 text-[32px] font-extrabold leading-[1.12] tracking-[-0.02em] sm:text-[40px] xl:mt-[25px] xl:text-[42px] xl:leading-[1.15] desk:text-[44px] desk:leading-[1.16]">
            <span className="block">Apakah Anda Mengalami</span>
            <span className="block">Hal yang Sama?</span>
          </h2>
          <p className="mt-6 max-w-[34rem] text-[15px] leading-[1.7] text-[#324a76] sm:text-[16px] xl:mt-9">
            <span className="xl:block">Banyak bisnis tumbuh, tapi pemilik tetap merasa kewalahan.</span>{" "}
            <span className="xl:block">Mungkin Anda juga merasakan:</span>
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-[18px]">
          {problems.map((problem) => {
            const Icon = problem.icon;
            return (
            <li key={problem.title}>
              <article className="flex h-full items-center gap-3.5 rounded-[22px] bg-white px-4 py-4 shadow-[0_8px_24px_rgba(16,32,64,0.05)] sm:gap-4 sm:px-[18px] sm:py-4 desk:min-h-[124px] desk:px-5">
                <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-gold text-[#10203f] sm:h-[58px] sm:w-[58px]">
                  <Icon />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold leading-tight text-[#10203f] sm:text-[16px]">{problem.title}</h3>
                  <p className="mt-1 text-[13px] leading-snug text-[#5c6d88] sm:text-[14px]">{problem.text}</p>
                </div>
              </article>
            </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
