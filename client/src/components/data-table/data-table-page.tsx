import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DataTablePageProps = {
  children: ReactNode;
  description?: ReactNode;
  bleed?: boolean;
};

export function DataTablePage({
  children,
  description,
  bleed = false,
}: DataTablePageProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col",
        description && "space-y-3",
      )}
    >
      {description}
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          bleed && "-mx-4 -mt-4 -mb-4 md:-mx-6 md:-mt-6 md:-mb-6",
        )}
      >
        {children}
      </div>
    </div>
  );
}
