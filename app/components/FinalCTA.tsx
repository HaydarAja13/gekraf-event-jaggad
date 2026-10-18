import type { Site } from "@/lib/types";
import { CmsImage } from "./CmsImage";

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2"
        stroke="#0B0E16"
        strokeWidth="1.8"
      />
      <path d="M3.5 9.5h17" stroke="#0B0E16" strokeWidth="1.8" />
      <path
        d="M8 3.5v3M16 3.5v3"
        stroke="#0B0E16"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <circle cx="12" cy="12" r="12" fill="#F2CB19" />
      <path
        d="M17.4 14.3c-.3-.1-1.6-.8-1.8-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.1-.3.2-.6.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.5-.6c.1-.2.1-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.9 2.6 1.1 2.6.7 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3z"
        fill="#0B0E16"
      />
    </svg>
  );
}

export default function FinalCTA({ content }: { content: Site["cta"] }) {
  return (
    <section className="relative overflow-hidden bg-gekraf-cyan text-white">
      <div className="pointer-events-none absolute inset-0">
        <CmsImage
          src={content.image}
          alt=""
          fill
          className="object-cover object-center opacity-[0.25]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gekraf-cyan/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-gekraf-cyan via-gekraf-cyan/85 to-gekraf-cyan/60" />
      </div>

      <div className="mx-auto w-[95%] px-4 sm:px-8 lg:px-12 relative grid items-center gap-8 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:py-24">
        <div>
          <span className="inline-flex rounded-full border border-gekraf-gold bg-gekraf-gold/20 px-3.5 py-1 text-[14px] sm:text-[15px] lg:text-[16px] font-extrabold tracking-[0.14em] text-white uppercase">
            {content.badge}
          </span>
          <h2 className="mt-4 sm:mt-5 font-serif text-[clamp(1.95rem,3.2vw,2.725rem)] leading-[1.15] font-extrabold text-white text-balance">
            {content.title}
          </h2>
          <p className="mt-3.5 max-w-[30rem] text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.7] text-white/85">
            {content.body}
          </p>
        </div>

        <div className="flex flex-col items-start lg:justify-self-end w-full sm:w-auto">
          <a
            href={content.buttonHref}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-gekraf-gold px-8 py-4 sm:px-9 sm:py-4.5 text-[17px] sm:text-[19px] font-extrabold text-gekraf-ink shadow-[0_8px_28px_rgba(242,203,25,0.28)] transition hover:bg-gekraf-gold-bright active:scale-[0.99]"
          >
            <CalendarIcon />
            <span>{content.button}</span>
            <span aria-hidden className="text-[19px]">
              →
            </span>
          </a>
          <a
            href={content.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2.5 text-[15px] sm:text-[17px] text-white/90 transition hover:text-white"
          >
            <WhatsAppIcon />
            <span>
              {content.whatsappText}{" "}
              <strong className="font-bold underline decoration-gekraf-gold decoration-2 underline-offset-4">{content.whatsappNumber}</strong>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
