import type { Site } from "@/lib/types";

export default function Curriculum({ content }: { content: Site["curriculum"] }) {
  return (
    <section id="kurikulum" className="bg-gekraf-cyan text-white">
      <div className="mx-auto grid w-[95%] gap-8 px-4 sm:px-8 lg:px-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-14 lg:py-24">
        <div className="min-w-0">
          <span className="inline-flex rounded-full border border-gekraf-gold bg-gekraf-gold/20 px-3.5 py-1 text-[14px] sm:text-[15px] lg:text-[16px] font-extrabold tracking-[0.14em] text-white uppercase">
            {content.badge}
          </span>
          <h2 className="mt-4 sm:mt-5 font-serif text-[clamp(1.85rem,3.2vw,2.625rem)] leading-[1.18] font-bold text-white text-balance">
            {content.title.split("\n").map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="mt-3.5 max-w-[26rem] text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.7] text-white/85">
            {content.body}
          </p>
        </div>

        <ol className="flex min-w-0 flex-col gap-3 sm:gap-3.5">
          {content.modules.map((m, i) => (
            <li key={`${m.title}-${i}`} className="flex items-start gap-3 sm:gap-4">
              <span className="mt-1 flex h-[42px] w-[42px] sm:h-[48px] sm:w-[48px] shrink-0 items-center justify-center rounded-full bg-gekraf-gold text-[17px] sm:text-[19px] font-extrabold text-gekraf-ink shadow-[0_2px_10px_rgba(242,203,25,0.3)]">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 rounded-2xl bg-[#f8fbff] p-4 sm:px-6 sm:py-4.5 shadow-[0_4px_20px_rgba(2,153,195,0.06)]">
                <p className="text-[16px] sm:text-[18px] leading-snug font-bold text-gekraf-ink">
                  {m.title}
                </p>
                <p className="mt-1 text-[14px] sm:text-[16px] leading-snug text-[#4a70a0]">
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
