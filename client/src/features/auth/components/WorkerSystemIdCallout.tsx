import { cn } from "@/lib/utils";

type WorkerSystemIdCalloutProps = {
  systemId: string;
  variant?: "default" | "success";
  className?: string;
};

export function WorkerSystemIdCallout({
  systemId,
  variant = "default",
  className,
}: WorkerSystemIdCalloutProps) {
  return (
    <div
      role="status"
      className={cn(
        "space-y-2 rounded-md border px-4 py-3",
        variant === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-950"
          : "border-border bg-muted text-foreground",
        className,
      )}
    >
      <p className="text-sm font-medium">Your System ID</p>
      <p className="font-mono text-lg font-semibold tracking-wide">{systemId}</p>
      <p className="text-sm">
        Save this ID — use it with your password to sign in.
      </p>
    </div>
  );
}
