import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "lucide-react";

type WorkerPageShellProps = {
  title?: string;
  backTo?: string;
  backLabel?: string;
  children: React.ReactNode;
};

export function WorkerPageShell({
  title,
  backTo,
  backLabel = "Back",
  children,
}: WorkerPageShellProps) {
  return (
    <main className="mx-auto min-h-dvh max-w-sm space-y-4 p-4">
      {backTo ? (
        <Link
          to={backTo}
          className="inline-flex min-h-11 items-center gap-1 text-base text-primary"
        >
          <ChevronLeftIcon className="size-4" aria-hidden />
          {backLabel}
        </Link>
      ) : null}

      {title ? <h1 className="text-2xl font-semibold">{title}</h1> : null}

      {children}
    </main>
  );
}
