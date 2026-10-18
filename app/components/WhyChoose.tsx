import type { Site } from "@/lib/types";

const benefits = [
  {
    line1: "Sesi Kelas",
    line2: "Interaktif",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="8.5" cy="8" r="2.6" stroke="#0B0E16" strokeWidth="1.8" />
        <circle cx="15.5" cy="8" r="2.6" stroke="#0B0E16" strokeWidth="1.8" />
        <circle cx="12" cy="13.5" r="2.2" stroke="#0B0E16" strokeWidth="1.8" />
        <path
          d="M3.5 19c.6-2.4 2.4-3.6 5-3.6M15.5 15.4c2.6 0 4.4 1.2 5 3.6M8.5 15.6c1.1-.5 2.4-.5 3.5 0"
          stroke="#0B0E16"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    line1: "Business Mastery",
    line2: "Workbook",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 6a2 2 0 012-2h5v15H6a2 2 0 01-2-2V6z"
          stroke="#0B0E16"
          strokeWidth="1.8"
        />
        <path
          d="M20 6a2 2 0 00-2-2h-5v15h5a2 2 0 002-2V6z"
          stroke="#0B0E16"
          strokeWidth="1.8"
        />
        <path d="M11 4v15" stroke="#0B0E16" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    line1: "Studi Kasus",
    line2: "dan Diskusi",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3.5 7.5A2.5 2.5 0 016 5h9.5A2.5 2.5 0 0118 7.5v5a2.5 2.5 0 01-2.5 2.5H9l-3.5 2.8V15A2.5 2.5 0 013.5 12.5v-5z"
          stroke="#0B0E16"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M18 9.5h.5A2.5 2.5 0 0121 12v4.5a2.5 2.5 0 01-2.5 2.5H17l-2.2 1.8V19"
          stroke="#0B0E16"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    line1: "90-Day",
    line2: "Action Plan",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="13" r="7" stroke="#0B0E16" strokeWidth="1.8" />
        <circle cx="12" cy="13" r="4" stroke="#0B0E16" strokeWidth="1.8" />
        <circle cx="12" cy="13" r="1.3" fill="#0B0E16" />
        <path
          d="M15.8 5.2l3-3M18.8 2.2l1.6 2.8-2.9-1.2"
          stroke="#0B0E16"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function WhyChoose({ content }: { content: Site["why"] }) {
  return (
    <section className="bg-gekraf-surface">
      <div className="mx-auto w-[95%] px-4 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">
        <div className="max-w-[44rem]">
          <span className="inline-flex rounded-full bg-gekraf-gold px-3.5 py-1 text-[14px] sm:text-[15px] lg:text-[16px] font-extrabold tracking-[0.14em] text-gekraf-ink uppercase">
            {content.badge}
          </span>
          <h2 className="mt-4 sm:mt-5 font-serif text-[clamp(1.85rem,3.4vw,2.725rem)] leading-[1.18] font-extrabold text-gekraf-ink text-balance">
            {content.title.split("\n").map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="mt-3.5 max-w-[38rem] text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.7] text-gekraf-muted">
            {content.body}
          </p>
        </div>

        <div className="mt-10 sm:mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {content.benefits.map((b, i) => (
            <article
              key={`${b.line1}-${b.line2}-${i}`}
              className="flex items-center gap-4 rounded-2xl bg-white p-4.5 sm:p-5 shadow-[0_6px_24px_rgba(2,153,195,0.08)] transition-transform hover:-translate-y-0.5"
            >
              <span className="flex h-13 w-13 sm:h-15 sm:w-15 shrink-0 items-center justify-center rounded-xl bg-gekraf-gold shadow-[0_2px_12px_rgba(242,203,25,0.3)]">
                {benefits[i]?.icon ?? benefits[0].icon}
              </span>
              <p className="text-[16px] sm:text-[18px] leading-snug font-bold text-gekraf-ink">
                <span className="block">{b.line1}</span>
                <span className="block">{b.line2}</span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
