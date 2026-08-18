import Link from "next/link";
import { Cpu } from "lucide-react";
import { Container } from "@/components/ui/container";

const FOOTER_LINKS = {
  Platform: [
    { href: "/learn", label: "Learn Robotics" },
    { href: "/projects", label: "Projects" },
    { href: "/community", label: "Community" },
    { href: "/resources", label: "Resources" },
  ],
  Club: [
    { href: "/about", label: "About the club" },
    { href: "/events", label: "Events" },
    { href: "/join", label: "Join us" },
    { href: "/gallery", label: "Gallery" },
  ],
  Support: [{ href: "/contact", label: "Contact" }],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-surface/40">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2 font-display font-semibold">
            <Cpu className="h-5 w-5 text-primary" strokeWidth={2} />
            Tarkwa Robotic Hub
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted">
            The learning platform, club, and collaboration hub for Tarkwa
            Senior High School robotics.
          </p>
        </div>

        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading}>
            <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted">
              {heading}
            </p>
            <ul className="flex flex-col gap-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-border/60 py-6">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Tarkwa Senior High School Robotics Club.</p>
          <p className="font-mono">BUILD // LEARN // CONNECT</p>
        </Container>
      </div>
    </footer>
  );
}
