const modules = [
  {
    n: 1,
    title: "Build a High-Performance Organization",
    desc: "Strategi membangun tim dan sistem kerja yang produktif.",
  },
  {
    n: 2,
    title: "Build a Brand That Sells",
    desc: "Strategi marketing dan penjualan yang menghasilkan.",
  },
  {
    n: 3,
    title: "From Small Business to Scalable Business",
    desc: "Peluang, hambatan, dan strategi pertumbuhan.",
  },
  {
    n: 4,
    title: "Business Mastery Lab",
    desc: "Studi kasus dan simulasi penyusunan strategi bisnis.",
  },
  {
    n: 5,
    title: "Executive Business Talk & Q&A",
    desc: "Diskusi langsung dengan para pembicara.",
  },
  {
    n: 6,
    title: "90-Day Business Action Plan",
    desc: "Menyusun rencana implementasi untuk 90 hari ke depan.",
  },
];

export default function Curriculum() {
  return (
    <section id="kurikulum" className="bg-gekraf-cyan text-white">
      <div className="mx-auto grid w-[95%] gap-12 px-6 py-20 sm:px-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-14 lg:px-12 lg:py-24">
        <div className="min-w-0 overflow-hidden">
          <span className="inline-flex rounded-full border border-gekraf-gold bg-gekraf-gold/20 px-4 py-1.5 text-[16px] font-extrabold tracking-[0.16em] text-white uppercase">
            Kurikulum
          </span>
          {/* exact 2 lines — matches reference */}
          <h2 className="mt-6 font-serif text-[clamp(1.725rem,2.6vw,2.625rem)] leading-[1.2] font-bold text-white">
            <span className="block sm:whitespace-nowrap">
              Apa yang Akan Dipelajari
            </span>
            <span className="block sm:whitespace-nowrap">Selama 1 Hari?</span>
          </h2>
          <p className="mt-5 max-w-[22rem] text-[18px] leading-[1.7] text-white/80">
            Materi dirancang praktis, berbasis pengalaman nyata, dan dapat
            langsung diterapkan di bisnis Anda.
          </p>
        </div>

        <ol className="flex min-w-0 flex-col gap-[14px]">
          {modules.map((m) => (
            <li key={m.n} className="flex items-center gap-3 sm:gap-4">
              <span className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-gekraf-gold text-[19px] font-extrabold text-gekraf-ink">
                {m.n}
              </span>
              <div className="min-w-0 flex-1 rounded-2xl bg-[#f8fbff] px-6 py-4">
                <p className="text-[18px] leading-snug font-bold text-gekraf-ink">
                  {m.title}
                </p>
                <p className="mt-1 text-[18px] leading-snug text-[#4a70a0]">
                  {m.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
