import { Link } from "react-router-dom";

import { Button } from "@/components/base/button";

export function LandingHeader() {
  return (
    <header className="flex items-center justify-end gap-2 p-4">
      <Button asChild>
        <Link to="/register">Register</Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/login">Log in</Link>
      </Button>
    </header>
  );
}
