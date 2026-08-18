import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">
        Log in to continue your learning progress.
      </p>
      <div className="mt-8">
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
