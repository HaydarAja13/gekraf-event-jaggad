import type { Site } from "@/lib/types";
import { CmsImage } from "./CmsImage";

function Stars() {
  return (
    <div className="flex gap-1" aria-label="5 dari 5 bintang">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="#F2CB19"
          aria-hidden
        >
          <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.4l1.1-6.5L2.6 9.3l6.5-.9L12 2.5z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials({ content }: { content: Site["testimonials"] }) {
  return (
    <section id="testimoni" className="bg-gekraf-surface">
      <div className="mx-auto w-[95%] px-4 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[46rem] text-center">
          <span className="inline-flex rounded-full bg-gekraf-gold px-3.5 py-1 text-[14px] sm:text-[15px] lg:text-[16px] font-extrabold tracking-[0.14em] text-gekraf-ink uppercase">
            {content.badge}
          </span>
          <h2 className="mt-4 sm:mt-5 font-serif text-[clamp(1.95rem,3.5vw,2.575rem)] leading-[1.2] font-extrabold text-gekraf-ink text-balance">
            {content.title}
          </h2>
          <p className="mx-auto mt-3 max-w-[36rem] text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.65] text-[#5F7C97]">
            {content.body}
          </p>
        </div>

        <div className="mt-10 sm:mt-12 grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {content.items.map((t, i) => (
            <article
              key={`${t.name}-${i}`}
              className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-7 shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-transform hover:-translate-y-0.5 md:last:col-span-2 md:last:max-w-md md:last:mx-auto lg:last:col-span-1 lg:last:max-w-none w-full"
            >
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0">
                  <CmsImage
                    src={t.src}
                    alt={t.name}
                    width={56}
                    height={56}
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover"
                  />
                  <span className="absolute -right-0.5 -bottom-0.5 flex h-4.5 w-4.5 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-[#22C55E] ring-2 ring-white">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6.2l2.3 2.3 4.7-4.8"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
                <div>
                  <p className="text-[17px] sm:text-[19px] font-bold text-gekraf-ink">
                    {t.name}
                  </p>
                  <p className="text-[14px] sm:text-[16px] text-[#5F7C97]">{t.role}</p>
                </div>
              </div>

              <div className="mt-4 sm:mt-5">
                <Stars />
              </div>

              <p className="mt-3.5 text-[15px] sm:text-[17px] leading-[1.65] text-[#1E293B]">
                “{t.text}”
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
