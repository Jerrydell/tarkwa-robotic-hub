import { GraduationCap, Wrench, Users, Target } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { PageHero } from "@/components/shared/page-hero";
import { Reveal } from "@/components/shared/reveal";

const IDENTITIES = [
  {
    icon: GraduationCap,
    title: "A learning platform",
    description:
      "Structured, level-based robotics education — from your first circuit to AI-assisted builds — open to any student at Tarkwa Senior High.",
  },
  {
    icon: Users,
    title: "A club website",
    description:
      "The home for club identity, meetings, workshops, and competitions — everything you need to know about what the club is doing.",
  },
  {
    icon: Wrench,
    title: "A collaboration hub",
    description:
      "Where verified members team up, submit real projects, and get feedback from admins and each other.",
  },
];

const VALUES = [
  "Learning by building, not just reading",
  "Every student starts from wherever they are — no prior experience required",
  "Club membership is earned, not automatic, and reviewed fairly",
  "Projects are judged on effort and problem-solving, not just polish",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About the club"
        title="Built by students, for students"
        description="The Tarkwa Senior High School Robotics Club exists to make robotics genuinely learnable and genuinely fun to build — whether you're brand new or already tinkering on your third project."
      />

      <section className="py-20">
        <Container>
          <div className="grid gap-6 sm:grid-cols-3">
            {IDENTITIES.map((identity, i) => (
              <Reveal key={identity.title} delay={i * 0.1}>
                <Card className="h-full p-8">
                  <identity.icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
                  <h3 className="mt-5 font-semibold">{identity.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {identity.description}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border/60 bg-surface/30 py-20">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <div>
              <Target className="h-7 w-7 text-identity-light" strokeWidth={1.5} />
              <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">
                What we care about
              </h2>
              <p className="mt-3 text-muted">
                A few principles that shape how the club and the platform
                actually work, day to day.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="flex flex-col gap-4">
              {VALUES.map((value) => (
                <li key={value} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-muted">{value}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
