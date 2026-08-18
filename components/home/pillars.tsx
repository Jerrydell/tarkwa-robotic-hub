import { GraduationCap, Wrench, Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/shared/reveal";

const PILLARS = [
  {
    icon: GraduationCap,
    title: "Learn",
    description:
      "Structured paths from beginner to advanced — electronics, Arduino, sensors, and AI in robotics. Track your progress and build a daily streak.",
  },
  {
    icon: Wrench,
    title: "Build",
    description:
      "Explore real projects built by the club, and once you're a verified member, join a team and submit your own for approval.",
  },
  {
    icon: Users,
    title: "Connect",
    description:
      "Ask questions, help other students, and stay in the loop on workshops, meetings, and competitions.",
  },
];

export function Pillars() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="What you'll do here"
          title="One platform, three ways in"
          align="center"
          description="Whichever door you come through, they all connect."
          className="mx-auto"
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.1}>
              <Card className="h-full p-8">
                <pillar.icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
                <h3 className="mt-5 text-xl font-semibold">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {pillar.description}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
