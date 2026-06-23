import { Link } from "react-router-dom";

import { Button } from "@/components/base/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/base/card";
import { formatSessionDate, formatSessionTopic } from "@/lib/session-format";
import type { SessionDto } from "@/types/session";

type RecentSubmissionsTableProps = {
  sessions: SessionDto[];
};

export function RecentSubmissionsTable({
  sessions,
}: RecentSubmissionsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">
          Recent submissions
        </CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link to="/supervisor/sessions">View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recent sessions for the selected filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Session ID</th>
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">Worker</th>
                  <th className="pb-2 pr-4 font-medium">Topic</th>
                  <th className="pb-2 font-medium">Reached</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.sessionId} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{session.sessionId}</td>
                    <td className="py-2 pr-4">
                      {formatSessionDate(session.sessionDate)}
                    </td>
                    <td className="py-2 pr-4">{session.workerId}</td>
                    <td className="py-2 pr-4">{formatSessionTopic(session)}</td>
                    <td className="py-2">{session.totalReached}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
