import type { Site } from "@/lib/types";
import { CmsImage } from "./CmsImage";

const frames = [
  { z: "z-[1]", frame: "lg:h-[500px]" },
  { z: "z-[2]", frame: "lg:h-[580px]" },
  { z: "z-[1]", frame: "lg:h-[500px]" },
];

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-full w-full">
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="#F2CB19"
        strokeWidth="1.6"
      />
      <path d="M3 9h18" stroke="#F2CB19" strokeWidth="1.6" />
      <path
        d="M8 3v4M16 3v4"
        stroke="#F2CB19"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-full w-full">
      <path
        d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"
        stroke="#F2CB19"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="10" r="2.5" stroke="#F2CB19" strokeWidth="1.6" />
    </svg>
  );
}

export default function Hero({ content }: { content: Site["hero"] }) {
  const [bayu, sandiaga, deryansha] = content.speakers;

  return (
    /* -mt menarik bg hero di bawah sticky navbar */
    <section className="relative -mt-[64px] sm:-mt-[68px] lg:-mt-[72px] overflow-hidden bg-gekraf-cyan pt-[64px] sm:pt-[68px] lg:pt-[72px] text-white">
      <div className="pointer-events-none absolute inset-0">
        {/* Lawang Sewu — desktop tetap persis referensi (scale 1.4), mobile disesuaikan */}
        <div className="absolute -right-[4%] bottom-0 h-[85%] sm:h-[90%] lg:h-[92%] w-[95%] sm:w-[88%] lg:w-[82%]">
          <CmsImage
            src={content.backgroundSrc}
            alt=""
            fill
            priority
            className="origin-bottom-right scale-100 sm:scale-110 lg:scale-[1.4] object-contain object-right-bottom opacity-40 sm:opacity-55 lg:opacity-[0.72]"
            sizes="(max-width: 768px) 100vw, 90vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-gekraf-cyan from-20% via-gekraf-cyan/80 via-45% to-gekraf-cyan/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-gekraf-cyan/25 via-transparent to-gekraf-cyan/70" />
        <div className="hero-glow absolute inset-0" />
      </div>

      <div className="relative mx-auto grid w-[95%] gap-4 px-4 pt-5 pb-6 sm:px-8 sm:pt-7 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-6 lg:px-12 lg:pt-8 lg:pb-0">
        {/* Konten Kiri */}
        <div className="relative z-10 w-full min-w-0 animate-fade-up pb-2 sm:pb-4 lg:pr-4 lg:pb-12">
          <span className="inline-flex rounded-full border border-gekraf-gold bg-gekraf-gold/20 px-3.5 py-1 text-[13px] sm:text-[15px] lg:text-[16px] font-extrabold tracking-[0.14em] text-white uppercase">
            {content.badge}
          </span>

          <h1 className="mt-3.5 sm:mt-5 font-serif text-[clamp(2.125rem,4.2vw,4.375rem)] leading-[1.02] font-bold tracking-[-0.02em]">
            <span className="block text-white">{content.titleLine1}</span>
            <span className="block">
              <span className="text-gekraf-gold">{content.titleGold}</span>{" "}
              <span className="text-white">{content.titleRest}</span>
            </span>
          </h1>

          <p className="mt-3 text-[16px] font-bold tracking-[-0.01em] text-white sm:text-[20px] lg:text-[22px]">
            {content.subtitle}
          </p>

          <p className="mt-2 max-w-none text-[15px] leading-[1.65] text-white/75 sm:text-[17px] lg:text-[19px]">
            {content.body}
          </p>

          <div className="mt-4 sm:mt-7 flex flex-col gap-3 sm:flex-row sm:gap-10 lg:gap-12">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center">
                <CalendarIcon />
              </div>
              <div>
                <p className="text-[15px] sm:text-[18px] font-bold text-white">{content.date}</p>
                <p className="text-[13.5px] sm:text-[18px] text-white/70">{content.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center">
                <PinIcon />
              </div>
              <div>
                <p className="text-[15px] sm:text-[18px] font-bold text-white">{content.venue}</p>
                <p className="text-[13.5px] sm:text-[18px] text-white/70">{content.city}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-8 flex flex-col items-start gap-1.5 sm:gap-2">
            <a
              id="daftar"
              href={content.ctaHref}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gekraf-gold px-7 py-3.5 sm:px-8 sm:py-4 text-[16px] sm:text-[18px] font-extrabold text-gekraf-ink shadow-[0_8px_28px_rgba(242,203,25,0.28)] transition hover:bg-gekraf-gold-bright active:scale-[0.99]"
            >
              {content.ctaLabel}
              <span aria-hidden>→</span>
            </a>
            <p className="text-[13px] sm:text-[18px] text-white/65">{content.quota}</p>
          </div>
        </div>

        {/* =========================================================================
            MOBILE & TABLET VIEW (< lg):
            - Tidak ada dead space kosong yang bolong di atas gambar
            - Foto pemateri besar, dead center 50%, simetris, tidak terpotong
            - VIP Speaker Bar nama & jabatan di layer depan tanpa tabrakan teks
           ========================================================================= */}
        <div className="relative z-10 w-full min-w-0 mt-3 sm:mt-5 lg:hidden">
          <div className="hero-rays pointer-events-none absolute inset-0" />

          {/* 3 Pemateri Mobile: Tinggi pas dengan aspect ratio (0 dead space di atas) */}
          <div className="relative mx-auto flex w-full max-w-[430px] sm:max-w-[560px] items-end justify-center">
            {/* Bayu (Kiri) */}
            {bayu && (
              <div className="relative z-[1] shrink-0 w-[38%] aspect-[4/5]">
                <CmsImage
                  src={bayu.src}
                  alt={bayu.name}
                  fill
                  priority
                  className="object-contain object-bottom"
                  sizes="(max-width: 640px) 38vw, 240px"
                />
              </div>
            )}

            {/* Sandiaga (Tengah - simetris -12% margin kiri-kanan, tepat di titik 50% layar) */}
            {sandiaga && (
              <div
                className="relative z-[2] shrink-0 w-[49%] aspect-[4/5]"
                style={{ marginLeft: "-12.5%", marginRight: "-12.5%" }}
              >
                <CmsImage
                  src={sandiaga.src}
                  alt={sandiaga.name}
                  fill
                  priority
                  className="object-contain object-bottom"
                  sizes="(max-width: 640px) 49vw, 300px"
                />
              </div>
            )}

            {/* Deryansha (Kanan) */}
            {deryansha && (
              <div className="relative z-[1] shrink-0 w-[38%] aspect-[4/5]">
                <CmsImage
                  src={deryansha.src}
                  alt={deryansha.name}
                  fill
                  priority
                  className="object-contain object-bottom"
                  sizes="(max-width: 640px) 38vw, 240px"
                />
              </div>
            )}
          </div>

          {/* VIP Speaker Nameplate Bar: 3 kolom rapi, mewah, bebas tabrakan */}
          <div className="relative z-30 -mt-7 sm:-mt-9 mx-auto w-full max-w-[410px] sm:max-w-[530px] px-1 sm:px-2">
            <div className="grid grid-cols-3 divide-x divide-white/15 rounded-2xl border border-white/25 bg-[#051226]/90 p-2 sm:p-2.5 backdrop-blur-md shadow-2xl text-center">
              {bayu && (
                <div className="flex flex-col justify-center px-1">
                  <p className="text-[10px] sm:text-[12px] font-extrabold uppercase tracking-wide text-white leading-tight">
                    {bayu.name}
                  </p>
                  <p className="mt-0.5 text-[8.5px] sm:text-[10px] text-white/75 leading-tight whitespace-pre-line">
                    {bayu.role}
                  </p>
                </div>
              )}
              {sandiaga && (
                <div className="flex flex-col justify-center px-1">
                  <p className="text-[10.5px] sm:text-[12.5px] font-extrabold uppercase tracking-wide text-gekraf-gold leading-tight">
                    {sandiaga.name}
                  </p>
                  <p className="mt-0.5 text-[8.5px] sm:text-[10px] text-gekraf-gold/90 font-medium leading-tight whitespace-pre-line">
                    {sandiaga.role}
                  </p>
                </div>
              )}
              {deryansha && (
                <div className="flex flex-col justify-center px-1">
                  <p className="text-[10px] sm:text-[12px] font-extrabold uppercase tracking-wide text-white leading-tight">
                    {deryansha.name}
                  </p>
                  <p className="mt-0.5 text-[8.5px] sm:text-[10px] text-white/75 leading-tight whitespace-pre-line">
                    {deryansha.role}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            DESKTOP VIEW (lg: 1024px+):
            - 100% PERSIS SEPERTI DESAIN ASLI REFERENSI CLIENT
            - Frame penuh: Sandiaga h-[580px], Bayu & Derry h-[500px] w-auto max-w-none
            - Overlap asli -space-x-44, figcaption asli di bottom-6
           ========================================================================= */}
        <div className="relative z-10 hidden lg:block lg:min-h-0 lg:overflow-visible">
          <div className="hero-rays pointer-events-none absolute inset-0" />
          <div className="lg:absolute lg:inset-x-0 lg:bottom-0 lg:max-w-none lg:flex lg:items-end lg:justify-center lg:-space-x-44">
            {content.speakers.map((s, i) => {
              const frame = frames[i] ?? frames[frames.length - 1];
              return (
                <figure
                  key={`desktop-${s.name}-${i}`}
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
