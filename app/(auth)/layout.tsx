import Link from "next/link";
import { Cpu } from "lucide-react";
import { Container } from "@/components/ui/container";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/60 py-5">
        <Container>
          <Link href="/" className="flex items-center gap-2 font-display font-semibold">
            <Cpu className="h-5 w-5 text-primary" strokeWidth={2} />
            Tarkwa Robotic Hub
          </Link>
        </Container>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
