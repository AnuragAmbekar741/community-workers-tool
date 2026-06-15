import { Link } from "react-router-dom";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/base/card";
import {
  formatSessionDate,
  formatSessionTopic,
  formatSessionVillage,
} from "@/lib/session-format";
import type { SessionDto } from "@/types/session";

type SessionCardProps = {
  session: SessionDto;
};

export function SessionCard({ session }: SessionCardProps) {
  return (
    <Link to={`/worker/sessions/${session.sessionId}`} className="block">
      <Card className="transition-colors hover:bg-muted/30">
        <CardHeader>
          <CardTitle>{formatSessionDate(session.sessionDate)}</CardTitle>
          <CardDescription>{formatSessionVillage(session)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-base">
          <p className="text-foreground">{formatSessionTopic(session)}</p>
          <p className="text-muted-foreground">
            {session.totalReached} people reached
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
