import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/base/card";

type OverviewStatCardProps = {
  title: string;
  value: ReactNode;
  description?: string;
};

export function OverviewStatCard({
  title,
  value,
  description,
}: OverviewStatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-semibold">{value}</p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
