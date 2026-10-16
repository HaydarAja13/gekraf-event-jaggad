function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type CtaButtonProps = {
  size?: "nav" | "hero";
  className?: string;
};

export function CtaButton({ size = "hero", className = "" }: CtaButtonProps) {
  const isNav = size === "nav";

  return (
    <a
      href="#daftar"
      className={`items-center justify-center rounded-full bg-gold font-extrabold text-ink transition-colors hover:bg-[#ffe15a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
        isNav
          ? "hidden h-[45px] min-w-[199px] gap-2.5 px-5 text-[14.5px] tracking-[-0.01em] md:inline-flex"
          : "inline-flex h-14 w-full max-w-[320px] gap-3 px-8 text-[16px] sm:h-16 sm:w-[299px] sm:text-[17px]"
      } ${className}`}
    >
      Daftar Sekarang
      <ArrowIcon className={isNav ? "h-[16px] w-[16px]" : "h-[18px] w-[18px]"} />
    </a>
  );
}
