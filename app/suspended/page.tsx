import { ShieldAlert } from "lucide-react";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <ShieldAlert className="h-10 w-10 text-warning" strokeWidth={1.5} />
      <h1 className="text-2xl font-semibold">Your account is suspended</h1>
      <p className="max-w-sm text-sm text-muted">
        A Super Admin has deactivated this account. If you think this is a
        mistake, reach out to the club through the Contact page.
      </p>
      <SignOutButton className="mt-2" />
    </div>
  );
}
