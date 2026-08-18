import { Mail, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/shared/page-hero";
import { Reveal } from "@/components/shared/reveal";
import { ContactForm } from "@/components/contact/contact-form";

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get in touch"
        description="Questions about the club, the platform, or anything robotics-related — send us a message and we'll get back to you."
      />

      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-primary" strokeWidth={1.5} />
                <div>
                  <p className="font-medium">Prefer email?</p>
                  <p className="text-sm text-muted">
                    Reach the club directly at{" "}
                    <span className="text-foreground">robotics@tarkwashs.edu.gh</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-primary" strokeWidth={1.5} />
                <div>
                  <p className="font-medium">Find us</p>
                  <p className="text-sm text-muted">
                    Science Block, Tarkwa Senior High School
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </Container>
      </section>
    </>
  );
}
