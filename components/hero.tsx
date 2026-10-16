import Image from "next/image";
import { CtaButton } from "@/components/cta-button";

const speakers = [
  {
    name: "BAYU SETYA",
    role: ["HR & People", "Management"],
    image: "https://placehold.co/520x720/1a3d72/f7f8fb.png?text=Bayu+Setya",
    frame: "h-40 sm:h-56 md:h-72 desk:h-[400px]",
    stack: "z-20",
  },
  {
    name: "SANDIAGA UNO",
    role: ["Entrepreneurship", "& Business Growth"],
    image: "https://placehold.co/560x800/24548f/f7f8fb.png?text=Sandiaga+Uno",
    frame: "h-44 sm:h-64 md:h-80 desk:h-[470px]",
    stack: "z-10 desk:-ml-8",
  },
  {
    name: "DERRY KASSIOLUSI",
    role: ["Marketing, Brand", "& Business"],
    image: "https://placehold.co/520x740/14243f/f7f8fb.png?text=Derry+Kassiolusi",
    frame: "h-40 sm:h-60 md:h-72 desk:h-[420px]",
    stack: "z-30 desk:-ml-6",
  },
];

function CalendarIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0 text-gold" fill="none" aria-hidden="true">
      <rect x="6" y="9" width="28" height="25" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 16.5h28M14 5.5v7M26 5.5v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 23h4M14 28h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0 text-gold" fill="none" aria-hidden="true">
      <path
        d="M20 34s9-7.4 9-14.2a9 9 0 1 0-18 0C11 26.6 20 34 20 34z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="19.5" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function Hero() {
  return (
    <section id="beranda" className="relative overflow-hidden bg-navy">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[54%] desk:block" aria-hidden="true">
        <Image
          src="https://placehold.co/1100x900/1d5ea8/f6d56a.png?text=Lawang+Sewu"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover object-[70%_18%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/25" />
        <div className="absolute top-[24%] right-[8%] h-[2px] w-[380px] rotate-[-31deg] bg-gradient-to-r from-transparent via-gold to-transparent opacity-80" />
        <div className="absolute top-[46%] right-[2%] h-[2px] w-[300px] rotate-[-31deg] bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-80 desk:hidden" aria-hidden="true">
        <Image
          src="https://placehold.co/1100x700/12325f/f6d56a.png?text=Lawang+Sewu"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-top opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/90 to-navy" />
      </div>

      <div className="relative mx-auto w-full max-w-[1474px] px-5 sm:px-8 lg:px-12 xl:px-[126px]">
        <div className="relative z-20 pt-[22px] pb-1 xl:pt-[28px] xl:pb-8">
          <p className="inline-flex h-[34px] items-center rounded-full border-2 border-gold px-3.5 text-[9.5px] font-bold tracking-[0.12em] text-gold sm:px-5 sm:text-[12px] sm:tracking-[0.18em]">
            NATIONAL BUSINESS GROWTH CLASS
          </p>

          <h1 className="mt-5 font-black uppercase leading-[0.9] tracking-[-0.03em] text-white text-[clamp(2rem,7.4vw,3.15rem)] sm:text-[3.35rem] lg:text-[4.15rem] xl:mt-4 xl:text-[4.35rem] xl:leading-[0.9] desk:text-[76px] desk:leading-[0.86]">
            <span className="block">BUSINESS</span>
            <span className="block desk:whitespace-nowrap">
              SKILL <span className="text-gold-deep">MASTERY</span>
            </span>
          </h1>

          <p className="mt-5 max-w-[36rem] text-[18px] font-bold leading-[1.32] text-white sm:text-[22px] xl:mt-[22px] xl:text-[25px] xl:leading-[1.32]">
            <span className="block">Build Your Business.</span>
            <span className="block">Lead Your People. Scale Your Impact.</span>
          </p>

          <p className="mt-5 max-w-[34rem] text-[15px] leading-[1.65] text-white sm:text-[16px] sm:leading-[1.7] xl:mt-6 xl:max-w-[536px]">
            <span className="xl:block">Satu hari intensif bersama para praktisi &amp; pemimpin bisnis</span>{" "}
            <span className="xl:block">untuk menambah Anda dengan strategi yang terbukti,</span>{" "}
            <span className="xl:block">bukan sekadar teori.</span>
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-10 xl:mt-7">
            <div className="flex items-center gap-3">
              <CalendarIcon />
              <div className="text-[13.5px] leading-[1.35] text-white sm:text-[14.5px]">
                <p className="font-semibold">Sabtu, 15 Maret 2027</p>
                <p>08.00 – 12.30 WIB</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PinIcon />
              <div className="text-[13.5px] leading-[1.35] text-white sm:text-[14.5px]">
                <p className="font-semibold">Smesreneng, Jawa Tengah</p>
                <p>Lokasi akan diumumkan</p>
              </div>
            </div>
          </div>

          <div id="daftar" className="mt-6 scroll-mt-24 xl:mt-6">
            <CtaButton />
            <p className="mt-3.5 text-[13px] text-white/90 sm:text-[14px]">Kuota terbatas untuk 200 peserta</p>
          </div>
        </div>
      </div>

      <ul className="relative z-10 mt-4 grid grid-cols-3 items-end gap-2 px-5 pb-8 sm:mt-8 sm:gap-4 sm:px-8 sm:pb-10 lg:px-12 desk:absolute desk:right-0 desk:bottom-7 desk:mt-0 desk:flex desk:w-auto desk:items-end desk:gap-0 desk:px-0 desk:pb-0">
        {speakers.map((speaker) => (
          <li
            key={speaker.name}
            className={`relative w-full shrink-0 text-center desk:w-[272px] ${speaker.stack}`}
          >
            <div className={`relative mx-auto w-full overflow-hidden ${speaker.frame}`}>
              <Image
                src={speaker.image}
                alt={speaker.name}
                fill
                sizes="(max-width: 1400px) 30vw, 250px"
                className="object-cover object-top [mask-image:linear-gradient(to_bottom,black_72%,transparent_100%)]"
              />
            </div>
            <div className="relative z-10 -mt-2 px-0.5">
              <p className="text-[9px] font-extrabold tracking-[0.03em] text-white min-[400px]:text-[11px] sm:text-[13px] desk:text-[15px] desk:tracking-[0.04em]">
                {speaker.name}
              </p>
              <p className="mt-1 text-[9px] leading-[1.25] font-medium text-white/80 min-[400px]:text-[10px] sm:text-[12.5px] desk:text-[13.5px]">
                {speaker.role[0]}
                <br />
                {speaker.role[1]}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
