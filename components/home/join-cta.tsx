import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";

export function JoinCta() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(62,207,255,0.08),transparent_60%)]" />
      <Container className="relative">
        <Reveal>
          <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface p-10 text-center sm:p-14">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Ready to build something?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted">
              Sign up to start learning today. Once you&apos;ve found your feet,
              apply to join the club and start building with a team.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup">
                <Button size="lg">Create your account</Button>
              </Link>
              <Link href="/join">
                <Button variant="outline" size="lg">
                  Learn about membership
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
