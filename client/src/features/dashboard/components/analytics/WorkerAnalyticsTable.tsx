import { Link } from "react-router-dom";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/base/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/base/tooltip";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/base/card";
import { DISTRICT_OPTIONS } from "@/lib/constants";
import { getOptionLabel } from "@/lib/option-label";
import { formatSessionDate } from "@/lib/session-format";
import type { SupervisorAnalyticsWorkerRow } from "@/types/analytics";
import type { District } from "@/lib/constants";

import { getTopicChartLabel, formatMonthLabel } from "./analytics-utils";

type WorkerAnalyticsTableProps = {
  workers: SupervisorAnalyticsWorkerRow[];
  workerMonth: string;
  onWorkerMonthChange: (value: string) => void;
  monthOptions: string[];
};

function formatTopicsLabel(topics: string[]): string {
  if (topics.length === 0) {
    return "—";
  }
  return topics.map((topic) => getTopicChartLabel(topic)).join(", ");
}

export function WorkerAnalyticsTable({
  workers,
  workerMonth,
  onWorkerMonthChange,
  monthOptions,
}: WorkerAnalyticsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base font-semibold">Workers</CardTitle>
        <Select value={workerMonth} onValueChange={onWorkerMonthChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All months</SelectItem>
            {monthOptions.map((month) => (
              <SelectItem key={month} value={month}>
                {formatMonthLabel(month)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {workers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No workers in your organisation.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Worker ID</th>
                  <th className="pb-2 pr-4 font-medium">District</th>
                  <th className="pb-2 pr-4 font-medium">Sessions</th>
                  <th className="pb-2 pr-4 font-medium">Topics covered</th>
                  <th className="pb-2 pr-4 font-medium">Reach</th>
                  <th className="pb-2 pr-4 font-medium">Referred</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium">Last session</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => {
                  const topicsLabel = formatTopicsLabel(worker.topicsCovered);
                  return (
                    <tr
                      key={worker.workerId}
                      className="border-b last:border-0"
                    >
                      <td className="py-2 pr-4">
                        <Link
                          to={`/supervisor/sessions?workerId=${worker.workerId}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {worker.workerId}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">
                        {getOptionLabel(
                          DISTRICT_OPTIONS,
                          worker.district as District,
                        )}
                      </td>
                      <td className="py-2 pr-4">{worker.totalSessions}</td>
                      <td className="max-w-[200px] py-2 pr-4">
                        {worker.topicsCovered.length === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="line-clamp-1 truncate">
                                {topicsLabel}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              {topicsLabel}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </td>
                      <td className="py-2 pr-4">{worker.totalReach}</td>
                      <td className="py-2 pr-4">{worker.totalReferred}</td>
                      <td className="py-2 pr-4 capitalize">{worker.status}</td>
                      <td className="py-2">
                        {worker.lastSessionLog
                          ? formatSessionDate(worker.lastSessionLog)
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
