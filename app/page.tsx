import { Hero } from "@/components/hero";
import { Navbar } from "@/components/navbar";
import { PainPoints } from "@/components/pain-points";

export default function Home() {
  return (
    <>
      <div className="bg-navy text-white">
        <Navbar />
        <Hero />
      </div>
      <PainPoints />
    </>
  );
}
