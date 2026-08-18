import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/shared/page-hero";
import { Reveal } from "@/components/shared/reveal";

const STEPS = [
  {
    step: "01",
    title: "Create your account",
    description: "Sign up and start learning — no membership required to access the learning platform.",
  },
  {
    step: "02",
    title: "Apply from your dashboard",
    description: "Once you're comfortable with the basics, submit a membership application telling us why you want to join.",
  },
  {
    step: "03",
    title: "Admin review",
    description: "The Super Admin reviews your application. This usually takes a few days.",
  },
  {
    step: "04",
    title: "You're in",
    description: "Approved members can join project teams, submit projects, and see member-only updates.",
  },
];

const PERKS = [
  "Join or form a project team and build something real",
  "Submit projects for approval and get them featured publicly",
  "Access member-only updates and internal announcements",
  "Message other verified club members directly",
];

export default function JoinPage() {
  return (
    <>
      <PageHero
        eyebrow="Join the club"
        title="Membership is earned, not automatic"
        description="Anyone at Tarkwa Senior High can learn on the platform. Club membership — the badge that unlocks team projects and internal updates — is a short application away."
      >
        <Link href="/signup">
          <Button className="mt-8">Create your account to begin</Button>
        </Link>
      </PageHero>

      <section className="py-16 sm:py-20">
        <Container>
          <h2 className="text-2xl font-semibold">How it works</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.08}>
                <Card className="h-full p-6">
                  <span className="font-mono text-sm text-primary">{s.step}</span>
                  <h3 className="mt-3 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted">{s.description}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border/60 bg-surface/30 py-16 sm:py-20">
        <Container>
          <h2 className="text-2xl font-semibold">What membership unlocks</h2>
          <Reveal delay={0.1}>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
                  <span className="text-muted">{perk}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
