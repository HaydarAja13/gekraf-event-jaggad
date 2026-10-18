import type { Site } from "@/lib/types";
import { CmsImage } from "./CmsImage";

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className="mt-[3px] shrink-0"
    >
      <path
        d="M2.2 7.2l3.1 3.1 6.5-6.6"
        stroke="#F2CB19"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Speakers({ content }: { content: Site["speakers"] }) {
  return (
    <section id="pemateri" className="bg-gekraf-surface">
      <div className="mx-auto w-[95%] px-4 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto text-center">
          <span className="inline-flex rounded-full bg-gekraf-gold px-3.5 py-1 text-[14px] sm:text-[15px] lg:text-[16px] font-extrabold tracking-[0.14em] text-gekraf-ink uppercase">
            {content.badge}
          </span>
          <h2 className="mt-4 sm:mt-5 font-serif text-[clamp(1.95rem,3.6vw,2.675rem)] leading-[1.15] font-extrabold text-gekraf-ink text-balance">
            {content.title}
          </h2>
          <p className="mx-auto mt-3 max-w-[36rem] text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.65] text-[#5F7C97]">
            {content.body}
          </p>
        </div>

        {/* pt = space for speaker heads popping above card */}
        <div className="mt-6 sm:mt-8 grid gap-6 pt-14 sm:pt-16 md:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-7">
          {content.people.map((s, i) => (
            <article
              key={`${s.name}-${i}`}
              className="relative overflow-visible rounded-[20px] bg-gekraf-cyan text-white shadow-[0_12px_32px_rgba(2,153,195,0.18)] transition-transform hover:-translate-y-1 md:last:col-span-2 md:last:max-w-md md:last:mx-auto lg:last:col-span-1 lg:last:max-w-none w-full"
            >
              <div className="relative -mt-14 sm:-mt-16 aspect-[5/4] overflow-visible">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(248,212,80,0.32)_0%,transparent_58%)]" />
                <CmsImage
                  src={s.src}
                  alt={s.name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 380px"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-gekraf-cyan to-transparent" />
              </div>

              <div className="relative z-[1] px-6 pt-1 pb-7 sm:px-8 sm:pb-8">
                <h3 className="text-[18px] sm:text-[20px] font-extrabold tracking-[0.03em] uppercase">
                  {s.name}
                </h3>
                <p className="mt-0.5 text-[15px] sm:text-[17px] text-white/80">{s.title}</p>

                <span className="mt-3 inline-flex rounded-full bg-gekraf-gold px-3 py-0.5 text-[13px] sm:text-[14px] font-extrabold tracking-[0.12em] text-gekraf-ink uppercase">
                  {s.badge}
                </span>

                <p className="mt-3 text-[16px] sm:text-[18px] leading-snug font-bold text-white">
                  {s.headline}
                </p>

                <ul className="mt-3.5 space-y-2">
                  {s.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2.5 text-[15px] sm:text-[17px] leading-snug text-white/90"
                    >
                      <CheckIcon />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
