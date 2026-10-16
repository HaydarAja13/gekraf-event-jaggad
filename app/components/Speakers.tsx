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
      <div className="mx-auto w-[95%] px-6 py-20 sm:px-10 lg:px-12 lg:py-24">
        <div className="mx-auto text-center">
          <span className="inline-flex rounded-full bg-gekraf-gold px-4 py-1.5 text-[16px] font-extrabold tracking-[0.14em] text-gekraf-ink uppercase">
            {content.badge}
          </span>
          <h2 className="mt-5 text-[clamp(2.025rem,3.6vw,2.675rem)] leading-[1.15] font-extrabold text-gekraf-ink lg:whitespace-nowrap">
            {content.title}
          </h2>
          <p className="mx-auto mt-3 max-w-[36rem] text-[18px] leading-[1.65] text-[#5F7C97]">
            {content.body}
          </p>
        </div>

        {/* pt = space for heads popping above card — size stays full */}
        <div className="mt-8 grid gap-5 pt-16 md:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-7">
          {content.people.map((s, i) => (
            <article
              key={`${s.name}-${i}`}
              className="relative overflow-visible rounded-[18px] bg-gekraf-cyan text-white"
            >
              {/* same aspect as before, only shifted up so head exits the card */}
              <div className="relative -mt-16 aspect-[5/4] overflow-visible sm:-mt-20">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(248,212,80,0.32)_0%,transparent_58%)]" />
                <CmsImage
                  src={s.src}
                  alt={s.name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 420px"
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-gekraf-cyan to-transparent" />
              </div>

              <div className="relative z-[1] px-8 pt-2 pb-9 sm:px-10">
                <h3 className="text-[20px] font-extrabold tracking-[0.04em] uppercase">
                  {s.name}
                </h3>
                <p className="mt-0.5 text-[18px] text-white/70">{s.title}</p>

                <span className="mt-3.5 inline-flex rounded-full bg-gekraf-gold px-3.5 py-1 text-[16px] font-extrabold tracking-[0.14em] text-gekraf-ink uppercase">
                  {s.badge}
                </span>

                <p className="mt-3.5 text-[19px] leading-snug font-bold text-white">
                  {s.headline}
                </p>

                <ul className="mt-4 space-y-2.5">
                  {s.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2.5 text-[18px] leading-snug text-white/90"
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
