import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="mt-1 text-sm text-muted">
        Start learning robotics — no club membership required.
      </p>
      <div className="mt-8">
        <SignupForm />
      </div>
    </div>
  );
}
