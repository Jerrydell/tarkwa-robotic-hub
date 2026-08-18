import { BootSequence } from "@/components/home/boot-sequence";
import { Hero } from "@/components/home/hero";
import { StatsStrip } from "@/components/home/stats-strip";
import { Pillars } from "@/components/home/pillars";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { JoinCta } from "@/components/home/join-cta";

export default function HomePage() {
  return (
    <BootSequence>
      <Hero />
      <StatsStrip />
      <Pillars />
      <FeaturedProjects />
      <JoinCta />
    </BootSequence>
  );
}
