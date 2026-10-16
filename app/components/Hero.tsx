import type { Site } from "@/lib/types";
import { CmsImage } from "./CmsImage";

const frames = [
  { z: "z-[1]", frame: "h-[300px] sm:h-[380px] lg:h-[500px]" },
  { z: "z-[2]", frame: "h-[340px] sm:h-[440px] lg:h-[580px]" },
  { z: "z-[1]", frame: "h-[300px] sm:h-[380px] lg:h-[500px]" },
];

function CalendarIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="#F2CB19"
        strokeWidth="1.5"
      />
      <path d="M3 9h18" stroke="#F2CB19" strokeWidth="1.5" />
      <path
        d="M8 3v4M16 3v4"
        stroke="#F2CB19"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"
        stroke="#F2CB19"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="10" r="2.5" stroke="#F2CB19" strokeWidth="1.5" />
    </svg>
  );
}

export default function Hero({ content }: { content: Site["hero"] }) {
  return (
    /* -mt menarik bg hero di bawah sticky navbar (tinggi bar ~68–72px) */
    <section className="relative -mt-[68px] overflow-hidden bg-gekraf-cyan pt-[68px] text-white lg:-mt-[72px] lg:pt-[72px]">
      <div className="pointer-events-none absolute inset-0">
        {/* Lawang Sewu — right-aligned overlay, matches reference */}
        <div className="absolute -right-[4%] bottom-0 h-[92%] w-[95%] sm:w-[88%] lg:w-[82%]">
          <CmsImage
            src={content.backgroundSrc}
            alt=""
            fill
            priority
            className="origin-bottom-right scale-[1.4] object-contain object-right-bottom opacity-[0.72]"
            sizes="90vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-gekraf-cyan from-20% via-gekraf-cyan/80 via-45% to-gekraf-cyan/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-gekraf-cyan/25 via-transparent to-gekraf-cyan/70" />
        <div className="hero-glow absolute inset-0" />
      </div>

      {/* Tinggi hero = konten kiri; foto kanan absolute jadi nambah h foto tidak dorong section */}
      <div className="relative mx-auto grid w-[95%] gap-8 px-6 pt-6 pb-0 sm:px-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-6 lg:px-12 lg:pt-8 lg:pb-0">
        <div className="relative z-10 w-full min-w-0 animate-fade-up pb-10 lg:pr-4 lg:pb-12">
          <span className="inline-flex rounded-full border border-gekraf-gold bg-gekraf-gold/20 px-4 py-1.5 text-[16px] font-extrabold tracking-[0.16em] text-white uppercase">
            {content.badge}
          </span>

          <h1 className="mt-5 font-serif text-[clamp(2.725rem,4.2vw,4.375rem)] leading-[1.02] font-bold tracking-[-0.02em]">
            <span className="block text-white">{content.titleLine1}</span>
            <span className="block">
              <span className="text-gekraf-gold">{content.titleGold}</span>{" "}
              <span className="text-white">{content.titleRest}</span>
            </span>
          </h1>

          <p className="mt-4 text-[20px] font-bold tracking-[-0.01em] text-white sm:text-[22px]">
            {content.subtitle}
          </p>

          <p className="mt-3 max-w-none text-[18px] leading-[1.65] text-white/75 lg:text-[19px]">
            {content.body}
          </p>

          <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:gap-12">
            <div className="flex items-center gap-4">
              <CalendarIcon />
              <div>
                <p className="text-[18px] font-bold text-white">{content.date}</p>
                <p className="text-[18px] text-white/70">{content.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <PinIcon />
              <div>
                <p className="text-[18px] font-bold text-white">{content.venue}</p>
                <p className="text-[18px] text-white/70">{content.city}</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <a
              id="daftar"
              href={content.ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-gekraf-gold px-8 py-4 text-[18px] font-extrabold text-gekraf-ink shadow-[0_8px_28px_rgba(242,203,25,0.28)] transition hover:bg-gekraf-gold-bright"
            >
              {content.ctaLabel}
              <span aria-hidden>→</span>
            </a>
            <p className="mt-3 text-[18px] text-white/65">{content.quota}</p>
          </div>
        </div>

        <div className="relative z-10 min-h-[280px] min-w-0 overflow-hidden animate-fade-in delay-2 lg:min-h-0 lg:overflow-visible">
          <div className="hero-rays pointer-events-none absolute inset-0" />
          {/* lg: absolute bottom — tinggi frame tidak menambah tinggi hero */}
          <div className="flex max-w-full items-end justify-center -space-x-24 sm:-space-x-32 lg:absolute lg:inset-x-0 lg:bottom-0 lg:max-w-none lg:items-end lg:justify-center lg:-space-x-44">
            {content.speakers.map((s, i) => {
              const frame = frames[i] ?? frames[frames.length - 1];
              return (
              <figure
                key={`${s.name}-${i}`}
                className="relative flex shrink-0 flex-col items-center"
              >
                <div className={`relative shrink-0 ${frame.z} ${frame.frame}`}>
                  <CmsImage
                    src={s.src}
                    alt={s.name}
                    width={1080}
                    height={1350}
                    className="h-full w-auto max-w-none shrink-0 object-contain object-bottom"
                    sizes="320px"
                    priority
                  />
                </div>
                {/* nama di luar layer foto supaya tidak ketutup badan pemateri sebelah */}
                <figcaption className="absolute inset-x-0 bottom-6 z-30 px-1 text-center sm:bottom-8">
                    <p className="text-[16px] font-bold tracking-wide text-white uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                      {s.name}
                    </p>
                    <p className="mt-0.5 text-[16px] leading-snug whitespace-pre-line text-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                      {s.role}
                    </p>
                </figcaption>
              </figure>
            );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
