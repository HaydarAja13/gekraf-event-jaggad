import type { Site } from "@/lib/types";

const items = [
  {
    label: "Pemilik UMKM dan bisnis menengah",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="6"
          y="3.5"
          width="12"
          height="16"
          rx="1.5"
          stroke="#0B0E16"
          strokeWidth="1.7"
        />
        <path
          d="M9 8h6M9 11.5h6M9 15h3.5"
          stroke="#0B0E16"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M14.5 14.5l2 2 3.5-4"
          stroke="#0B0E16"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Founder startup dan pelaku usaha digital",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3.5l1.1 3.2h3.4l-2.75 2 1.05 3.3L12 10.2l-2.8 1.8 1.05-3.3-2.75-2h3.4L12 3.5z"
          stroke="#0B0E16"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 14.5c-1.8.8-3 2.4-3 4.5h13c0-2.1-1.2-3.7-3-4.5"
          stroke="#0B0E16"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M12 12.5v2"
          stroke="#0B0E16"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Direktur, manajer, dan pemimpin unit bisnis",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="7.5" r="3" stroke="#0B0E16" strokeWidth="1.7" />
        <path
          d="M12 10.5v2.2M10.2 12.7h3.6"
          stroke="#0B0E16"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M5.5 19.5c.9-3.2 3.2-4.8 6.5-4.8s5.6 1.6 6.5 4.8"
          stroke="#0B0E16"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Profesional yang ingin menjadi pengusaha",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="9" cy="8" r="2.7" stroke="#0B0E16" strokeWidth="1.7" />
        <circle cx="16.2" cy="8.8" r="2.3" stroke="#0B0E16" strokeWidth="1.7" />
        <path
          d="M3.8 18.5c.7-2.5 2.5-3.9 5.2-3.9s4.5 1.4 5.2 3.9"
          stroke="#0B0E16"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M15 14.5c1.9.25 3.4 1.3 4.1 3.2"
          stroke="#0B0E16"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Pengusaha muda dan generasi bisnis keluarga",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="4.5"
          y="4.5"
          width="15"
          height="15"
          rx="2"
          stroke="#0B0E16"
          strokeWidth="1.7"
        />
        <path
          d="M9 15V9h3.8c1.5 0 2.5.85 2.5 2.15S14.3 13.3 12.8 13.3H11"
          stroke="#0B0E16"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 13.3L15.2 17"
          stroke="#0B0E16"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function Audience({ content }: { content: Site["audience"] }) {
  return (
    <section id="fasilitas" className="bg-gekraf-cyan-deep text-white">
      <div className="mx-auto w-[95%] px-4 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[48rem] text-center">
          <span className="inline-flex rounded-full border border-gekraf-gold bg-gekraf-gold/20 px-3.5 py-1 text-[14px] sm:text-[15px] lg:text-[16px] font-extrabold tracking-[0.14em] text-white uppercase">
            {content.badge}
          </span>
          <h2 className="mt-4 sm:mt-5 font-serif text-[clamp(1.95rem,3.8vw,2.875rem)] leading-[1.15] font-bold text-white text-balance">
            {content.title}
          </h2>
          <p className="mx-auto mt-3.5 max-w-[40rem] text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.7] text-white/85">
            {content.body}
          </p>
        </div>

        <div className="mt-10 sm:mt-12 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
          {content.items.map((item, i) => (
            <article
              key={`${item.label}-${i}`}
              className="flex min-h-[170px] sm:min-h-[190px] lg:min-h-[220px] flex-col items-center rounded-2xl border-2 border-gekraf-gold/80 bg-white/5 p-4 sm:p-5 text-center transition-all hover:bg-white/10 sm:last:col-span-2 sm:last:max-w-sm sm:last:mx-auto lg:last:col-span-1 lg:last:max-w-none"
            >
              <span className="flex h-[60px] w-[60px] sm:h-[64px] sm:w-[64px] shrink-0 items-center justify-center rounded-full bg-gekraf-gold shadow-[0_4px_16px_rgba(242,203,25,0.25)]">
                {items[i]?.icon ?? items[0].icon}
              </span>
              <p className="mt-4 sm:mt-5 max-w-[13rem] text-[15px] sm:text-[17px] leading-[1.4] font-semibold text-white">
                {item.label}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
