import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DataTableViewVariant = "card" | "flush";
type DataTableViewLayout = "inline" | "sticky";

type DataTableViewProps = {
  toolbar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  selectionLabel?: ReactNode;
  variant?: DataTableViewVariant;
  layout?: DataTableViewLayout;
};

export function DataTableView({
  toolbar,
  children,
  footer,
  selectionLabel,
  variant = "card",
  layout = "inline",
}: DataTableViewProps) {
  return (
    <div
      className={cn(
        "border bg-card",
        variant === "card" && "rounded-lg shadow-sm",
        variant === "flush" && "rounded-none border-x-0 border-b-0 border-t-0 shadow-none",
        layout === "sticky" && "flex h-full min-h-0 flex-col",
      )}
    >
      {toolbar ? (
        <div className="shrink-0 border-b px-4 py-3">{toolbar}</div>
      ) : null}
      {selectionLabel ? (
        <div className="shrink-0 border-b px-4 py-2 text-sm text-muted-foreground">
          {selectionLabel}
        </div>
      ) : null}
      {children}
      {footer ? (
        <div
          className={cn(
            "border-t px-4",
            layout === "sticky" && "shrink-0",
          )}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export type { DataTableViewLayout, DataTableViewVariant };
