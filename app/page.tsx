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

export default function Home() {
  return (
    <main className="flex-1">
      <Navbar />
      <Hero />
      <PainPoints />
      <Audience />
      <Speakers />
      <Curriculum />
      <WhyChoose />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
    </main>
  );
}
