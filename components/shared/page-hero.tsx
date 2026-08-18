import { type ReactNode } from "react";
import { Container } from "@/components/ui/container";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="border-b border-border/60 bg-surface/30">
      <Container className="py-16 sm:py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{title}</h1>
        {description && (
          <p className="mt-4 max-w-2xl text-muted">{description}</p>
        )}
        {children}
      </Container>
    </section>
  );
}
