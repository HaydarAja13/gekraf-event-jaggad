import { CmsImage } from "@/app/components/CmsImage";
import type { Site } from "@/lib/types";

/*
  The A4 sheet. Until the event's own poster image exists it renders the
  event's real facts, laid out as the flyer a visitor would keep; pass `src`
  and the same frame swaps to the official artwork. Type scales with the
  sheet's own width (cqw), so the 210:297 proportion survives 320px and 396px.
*/
export function PosterA4({
  hero,
  src,
  className,
}: {
  hero: Site["hero"];
  src?: string;
  className?: string;
}) {
  const title = `${hero.titleLine1} ${hero.titleGold} ${hero.titleRest}`.trim();
  const label = `Pamflet ${hero.badge}: ${title}. ${hero.date}, ${hero.time}, ${hero.venue}, ${hero.city}.`;

  if (src) {
    return (
      <figure className={`poster-a4 ${className ?? ""}`} role="img" aria-label={label}>
        <CmsImage src={src} alt="" fill className="object-cover" sizes="(min-width: 1200px) 488px, (min-width: 1024px) 360px, min(92vw, 420px)" />
      </figure>
    );
  }

  return (
    <figure className={`poster-a4 ${className ?? ""}`} role="img" aria-label={label}>
      <span className="p-tag">A4 · 210 × 297 mm</span>

      <div className="p-brand">
        <span className="p-mark">BSM</span>
        Business Skill Mastery
      </div>

      <div className="p-band">{hero.badge}</div>

      <p className="p-title">
        {hero.titleLine1}
        <br />
        <em>{hero.titleGold}</em>
        <br />
        {hero.titleRest}
      </p>

      <div className="p-info">
        <b>{hero.date}</b>
        <span>{hero.time}</span>
        <b>{hero.venue}</b>
        <span>{hero.city}</span>
      </div>

      <figcaption className="p-foot">Pamflet acara · poster resmi menyusul</figcaption>
    </figure>
  );
}
