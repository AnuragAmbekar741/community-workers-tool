import { LoginForm } from "@/features/auth-login/LoginForm";

export function LandingSignInPanel() {
  return (
    <section
      id="sign-in"
      aria-labelledby="landing-sign-in-heading"
      className="flex min-h-dvh w-full flex-col justify-center bg-landing-panel-bg px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14"
    >
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h2 id="landing-sign-in-heading" className="text-2xl font-semibold">
            Sign in
          </h2>
          <p className="text-base text-muted-foreground">
            Workers and supervisors, one entry point.
          </p>
        </div>

        <LoginForm embedded />
      </div>
    </section>
  );
}
