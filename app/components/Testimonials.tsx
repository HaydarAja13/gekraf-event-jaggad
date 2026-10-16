import type { Site } from "@/lib/types";
import { CmsImage } from "./CmsImage";

function Stars() {
  return (
    <div className="flex gap-1" aria-label="5 dari 5 bintang">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="18"
          height="18"
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
      <div className="site-wrap py-20 lg:py-24">
        <div className="mx-auto max-w-[46rem] text-center">
          <span className="inline-flex rounded-full bg-gekraf-gold px-4 py-1.5 text-[16px] font-bold tracking-[0.14em] text-gekraf-ink uppercase">
            {content.badge}
          </span>
          <h2 className="mt-5 text-[clamp(1.975rem,3.5vw,2.575rem)] leading-[1.2] font-extrabold text-gekraf-ink">
            {content.title}
          </h2>
          <p className="mx-auto mt-3 max-w-[36rem] text-[18px] leading-[1.65] text-[#5F7C97]">
            {content.body}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {content.items.map((t, i) => (
            <article
              key={`${t.name}-${i}`}
              className="rounded-2xl border border-[#E2E8F0] bg-white p-7 sm:p-8"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0">
                  <CmsImage
                    src={t.src}
                    alt={t.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <span className="absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#22C55E] ring-2 ring-white">
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
                  <p className="text-[19px] font-bold text-gekraf-ink">
                    {t.name}
                  </p>
                  <p className="text-[18px] text-[#5F7C97]">{t.role}</p>
                </div>
              </div>

              <div className="mt-5">
                <Stars />
              </div>

              <p className="mt-4 text-[18px] leading-[1.65] text-[#1E293B]">
                “{t.text}”
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
