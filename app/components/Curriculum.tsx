import type { Site } from "@/lib/types";

export default function Curriculum({ content }: { content: Site["curriculum"] }) {
  return (
    <section id="kurikulum" className="bg-gekraf-cyan text-white">
      <div className="mx-auto grid w-[95%] gap-12 px-6 py-20 sm:px-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-14 lg:px-12 lg:py-24">
        <div className="min-w-0 overflow-hidden">
          <span className="inline-flex rounded-full border border-gekraf-gold bg-gekraf-gold/20 px-4 py-1.5 text-[16px] font-extrabold tracking-[0.16em] text-white uppercase">
            {content.badge}
          </span>
          <h2 className="mt-6 font-serif text-[clamp(1.725rem,2.6vw,2.625rem)] leading-[1.2] font-bold text-white">
            {content.title.split("\n").map((line, i) => (
              <span key={i} className="block sm:whitespace-nowrap">
                {line}
              </span>
            ))}
          </h2>
          <p className="mt-5 max-w-[22rem] text-[18px] leading-[1.7] text-white/80">
            {content.body}
          </p>
        </div>

        <ol className="flex min-w-0 flex-col gap-[14px]">
          {content.modules.map((m, i) => (
            <li key={`${m.title}-${i}`} className="flex items-center gap-3 sm:gap-4">
              <span className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-gekraf-gold text-[19px] font-extrabold text-gekraf-ink">
                {i + 1}
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
