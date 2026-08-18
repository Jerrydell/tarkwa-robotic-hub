import { Wrench } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Wrench className="h-10 w-10 text-primary" strokeWidth={1.5} />
      <h1 className="text-2xl font-semibold">Down for maintenance</h1>
      <p className="max-w-sm text-sm text-muted">
        The Robotic Hub is temporarily offline for maintenance. Please check
        back shortly.
      </p>
    </div>
  );
}
