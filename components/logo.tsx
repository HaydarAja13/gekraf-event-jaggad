import { useId } from "react";

export function Logo() {
  const rawId = useId().replace(/:/g, "");
  const gradientId = `bsm-gold-${rawId}`;

  return (
    <a href="#beranda" className="flex shrink-0 items-center gap-2.5">
      <svg
        viewBox="0 0 68 58"
        className="h-10 w-[46px] sm:h-[46px] sm:w-[54px]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="34" y1="2" x2="34" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE98A" />
            <stop offset="48%" stopColor="#FDD238" />
            <stop offset="100%" stopColor="#E2AC1C" />
          </linearGradient>
        </defs>
        <polygon
          points="17,3 51,3 64,29 51,55 17,55 4,29"
          fill="#021d3f"
          stroke={`url(#${gradientId})`}
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
        <polygon
          points="20.5,9 47.5,9 57.5,29 47.5,49 20.5,49 10.5,29"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.35"
        />
        <text
          x="34"
          y="34.5"
          textAnchor="middle"
          fill={`url(#${gradientId})`}
          fontSize="14.5"
          fontWeight="800"
          letterSpacing="-0.6"
          fontFamily="var(--font-montserrat), sans-serif"
        >
          BSM
        </text>
      </svg>
      <span className="text-[10.5px] font-extrabold leading-[1.08] tracking-[0.055em] text-white sm:text-[12.5px]">
        BUSINESS
        <br />
        SKILL MASTERY
      </span>
    </a>
  );
}
