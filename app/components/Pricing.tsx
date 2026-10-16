function TicketIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8.5A2.5 2.5 0 016.5 6h11A2.5 2.5 0 0120 8.5v1a1.5 1.5 0 100 3v1A2.5 2.5 0 0117.5 16h-11A2.5 2.5 0 014 13.5v-1a1.5 1.5 0 100-3v-1z"
        stroke="#F2CB19"
        strokeWidth="1.7"
      />
      <path
        d="M9 8v8M12 8v8M15 8v8"
        stroke="#F2CB19"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

function Check() {
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
        stroke="#FFFFFF"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const plans = [
  {
    name: "EARLYBIRD",
    priceWas: "Rp 1.499.000", // +500rb (coret)
    price: "Rp 999.000",
    features: [
      "Akses kelas 1 hari",
      "Workbook digital",
      "Sertifikat peserta",
      "Networking umum",
    ],
  },
  {
    name: "NORMAL",
    priceWas: "Rp 1.750.000",
    price: "Rp 1.250.000",
    features: [
      "Akses kelas 1 hari",
      "Workbook digital",
      "Sertifikat peserta",
      "Networking umum",
    ],
  },
  {
    name: "LAST CALL",
    priceWas: "Rp 2.000.000",
    price: "Rp 1.500.000",
    features: [
      "Akses kelas 1 hari",
      "Workbook digital",
      "Sertifikat peserta",
      "Networking umum",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="harga" className="bg-gekraf-cyan text-white">
      {/* 1 baris: kiri copy · kanan 3 card — sesuai referensi */}
      <div className="mx-auto grid w-[95%] gap-12 px-6 py-20 sm:px-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.45fr)] lg:items-center lg:gap-10 lg:px-12 lg:py-24">
        <div>
          <span className="inline-flex rounded-full border border-gekraf-gold bg-gekraf-gold/20 px-4 py-1.5 text-[16px] font-extrabold tracking-[0.16em] text-white uppercase">
            Pilih Tiket
          </span>
          <h2 className="mt-5 text-[clamp(2.025rem,3.6vw,2.675rem)] leading-[1.18] font-extrabold text-white">
            Investasi untuk Masa Depan Bisnis Anda
          </h2>
          <p className="mt-4 max-w-[22rem] text-[18px] leading-[1.7] text-white/80">
            Pilih tiket yang sesuai dengan kebutuhan Anda. Kuota terbatas untuk
            200 peserta.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {plans.map((p) => (
            <article
              key={p.name}
              className="relative flex flex-col rounded-2xl border-2 border-gekraf-gold px-5 pt-7 pb-5"
            >
              <div className="flex flex-col items-center text-center">
                <p className="text-[16px] font-extrabold tracking-[0.14em] text-white uppercase">
                  {p.name}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2.5">
                  <TicketIcon />
                  <div className="text-left">
                    <p className="text-[28px] leading-none font-extrabold tracking-tight text-white line-through decoration-[#ff3b30] decoration-4 sm:text-[32px]">
                      {p.priceWas}
                    </p>
                    <p className="mt-1 text-[24px] leading-none font-extrabold tracking-tight text-gekraf-gold sm:text-[28px]">
                      {p.price}
                    </p>
                  </div>
                </div>
              </div>

              <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-[17px] leading-snug text-white/90"
                  >
                    <Check />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#daftar"
                className="mt-6 inline-flex items-center justify-center rounded-full border border-white/40 bg-white/15 px-5 py-2.5 text-[18px] font-extrabold text-white transition hover:bg-white/25"
              >
                Pilih Tiket
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
