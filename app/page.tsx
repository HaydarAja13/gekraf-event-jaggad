import { Suspense } from "react";
import type { Metadata } from "next";
import Audience from "./components/Audience";
import Curriculum from "./components/Curriculum";
import FAQ from "./components/FAQ";
import FinalCTA from "./components/FinalCTA";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import PainPoints from "./components/PainPoints";
import Pricing from "./components/Pricing";
import SocialProof from "./components/SocialProof";
import Speakers from "./components/Speakers";
import Testimonials from "./components/Testimonials";
import WhyChoose from "./components/WhyChoose";
import { takenByPlan } from "@/lib/sales";
import { OG_IMAGE, SITE_NAME, SITE_URL, structuredData } from "@/lib/seo";
import { getSite } from "@/lib/site";
import type { Site } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  // Judul dari CMS, ditambah badge acara supaya tidak terlalu pendek di hasil
  // pencarian — kecuali badge itu sudah tertulis di judulnya.
  const title = site.seo.title.includes(site.hero.badge)
    ? site.seo.title
    : `${site.seo.title} — ${site.hero.badge}`;
  return {
    title: { absolute: title },
    description: site.seo.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: SITE_URL,
      siteName: SITE_NAME,
      title,
      description: site.seo.description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: site.seo.description,
      images: [OG_IMAGE.url],
    },
  };
}

export default async function Home() {
  const site = await getSite();

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData(site)).replace(/</g, "\\u003c"),
        }}
      />
      <Navbar content={site.navbar} />
      <Hero content={site.hero} />
      <PainPoints content={site.pain} />
      <Audience content={site.audience} />
      <Speakers content={site.speakers} />
      <Curriculum content={site.curriculum} />
      <WhyChoose content={site.why} />
      <Testimonials content={site.testimonials} />
      <Suspense fallback={<PricingFallback content={site.pricing} />}>
        <LivePricing content={site.pricing} />
      </Suspense>
      <FAQ content={site.faq} />
      <FinalCTA content={site.cta} />
      <SocialProof content={site.social} />
    </main>
  );
}

async function LivePricing({ content }: { content: Site["pricing"] }) {
  const taken = await takenByPlan();
  return <Pricing content={content} taken={taken} />;
}

function PricingFallback({ content }: { content: Site["pricing"] }) {
  return (
    <section id="harga" className="bg-gekraf-cyan text-white" aria-busy="true">
      <div className="mx-auto grid w-[95%] gap-8 px-4 sm:px-8 lg:px-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.45fr)] lg:items-center lg:gap-10 lg:py-24">
        <div>
          <span className="inline-flex rounded-full border border-gekraf-gold bg-gekraf-gold/20 px-3.5 py-1 text-[14px] sm:text-[15px] lg:text-[16px] font-extrabold tracking-[0.14em] text-white uppercase">
            {content.badge}
          </span>
          <h2 className="mt-4 sm:mt-5 font-serif text-[clamp(1.95rem,3.6vw,2.675rem)] leading-[1.18] font-extrabold text-white text-balance">
            {content.title}
          </h2>
          <p className="mt-3.5 max-w-[24rem] text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.7] text-white/85">{content.body}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.plans.map((plan) => (
            <article
              key={plan.name}
              className="flex min-h-[300px] flex-col rounded-2xl border-2 border-gekraf-gold/80 bg-white/5 p-5 sm:last:col-span-2 sm:last:max-w-md sm:last:mx-auto lg:last:col-span-1 lg:last:max-w-none w-full"
            >
              <p className="text-center text-[16px] font-extrabold tracking-[0.12em]">{plan.name}</p>
              <div className="mt-6 h-10 rounded-full bg-white/15" />
              <div className="mt-auto h-11 rounded-full bg-white/10" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
