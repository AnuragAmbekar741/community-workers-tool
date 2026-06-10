import { Link } from "react-router-dom";

import { Button } from "@/components/base/button";

export function AuthLoginStubPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 p-4">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <p className="text-base text-muted-foreground">Coming soon.</p>
      <Button asChild variant="outline" className="w-full">
        <Link to="/">Back to home</Link>
      </Button>
    </main>
  );
}
