const items = [
  {
    label: "Pemilik UMKM dan bisnis menengah",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
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
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
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
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
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
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
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
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
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

export default function Audience() {
  return (
    <section id="fasilitas" className="bg-gekraf-cyan-deep text-white">
      <div className="mx-auto w-[95%] px-6 sm:px-10 lg:px-12 py-20 lg:py-24">
        <div className="mx-auto max-w-[48rem] text-center">
          <span className="inline-flex rounded-full border border-gekraf-gold bg-gekraf-gold/20 px-4 py-1.5 text-[16px] font-extrabold tracking-[0.14em] text-white uppercase">
            Untuk Siapa
          </span>
          <h2 className="mt-5 font-serif text-[clamp(2.125rem,4vw,2.875rem)] leading-[1.15] font-bold text-white">
            Workshop Ini Cocok untuk Anda
          </h2>
          <p className="mx-auto mt-4 max-w-[40rem] text-[18px] leading-[1.7] text-white/85">
            Pemilik bisnis, founder startup, UMKM, eksekutif, dan profesional
            yang ingin mengembangkan bisnis secara lebih terstruktur dan
            berkelanjutan.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {items.map((item) => (
            <article
              key={item.label}
              className="flex min-h-[200px] flex-col items-center rounded-2xl border-2 border-gekraf-gold px-3 pt-4 pb-5 text-center lg:min-h-[220px]"
            >
              <span className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full bg-gekraf-gold">
                {item.icon}
              </span>
              <p className="mt-6 mx-4 max-w-[11rem] text-[18px] leading-[1.45] font-medium text-white sm:mx-5">
                {item.label}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
