import { Link } from "react-router-dom";

import { Button } from "@/components/base/button";

import { LoginForm } from "./LoginForm";

export function AuthLoginStubPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Log in</h1>
        <p className="text-base text-muted-foreground">
          Sign in with your phone or system ID.
        </p>
      </div>

      <LoginForm />

      <Button asChild variant="outline" className="h-11 w-full">
        <Link to="/">Back to home</Link>
      </Button>
    </main>
  );
}
