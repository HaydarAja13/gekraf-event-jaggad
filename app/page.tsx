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
import Speakers from "./components/Speakers";
import Testimonials from "./components/Testimonials";
import WhyChoose from "./components/WhyChoose";
import { takenByPlan } from "@/lib/sales";
import { getSite } from "@/lib/site";
import type { Site } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: site.seo.title,
    description: site.seo.description,
  };
}

export default async function Home() {
  const site = await getSite();

  return (
    <main className="flex-1">
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
      <div className="mx-auto grid w-[95%] gap-12 px-6 py-20 sm:px-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.45fr)] lg:items-center lg:gap-10 lg:px-12 lg:py-24">
        <div>
          <span className="inline-flex rounded-full border border-gekraf-gold bg-gekraf-gold/20 px-4 py-1.5 text-[16px] font-extrabold tracking-[0.16em] text-white uppercase">
            {content.badge}
          </span>
          <h2 className="mt-5 text-[clamp(2.025rem,3.6vw,2.675rem)] leading-[1.18] font-extrabold text-white">
            {content.title}
          </h2>
          <p className="mt-4 max-w-[22rem] text-[18px] leading-[1.7] text-white/80">{content.body}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {content.plans.map((plan) => (
            <article
              key={plan.name}
              className="flex min-h-[320px] flex-col rounded-[28px] border border-white/25 bg-white/10 p-6"
            >
              <p className="text-center text-[20px] font-extrabold tracking-[0.12em]">{plan.name}</p>
              <div className="mt-8 h-10 rounded-full bg-white/15" />
              <div className="mt-auto h-11 rounded-full bg-white/10" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
