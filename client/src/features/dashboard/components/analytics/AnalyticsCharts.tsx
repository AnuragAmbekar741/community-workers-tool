import { memo, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/base/card";
import type { SupervisorAnalyticsResponse } from "@/types/analytics";

import {
  CHART_COLORS,
  formatMonthLabel,
  getTopicChartLabel,
  REACH_DISTRIBUTION_LABELS,
} from "./analytics-utils";
import { ChartEmptyState } from "./ChartEmptyState";

type AnalyticsChartsProps = {
  data: SupervisorAnalyticsResponse;
};

function ReachByMonthChart({
  data,
}: {
  data: SupervisorAnalyticsResponse["reachByMonth"];
}) {
  const chartData = useMemo(
    () =>
      data.map((row) => ({
        ...row,
        label: formatMonthLabel(row.month),
      })),
    [data],
  );

  if (chartData.length === 0) {
    return <ChartEmptyState />;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="totalReached" fill="hsl(var(--primary))" name="Reached" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function SessionsByTopicChart({
  data,
}: {
  data: SupervisorAnalyticsResponse["sessionsByTopic"];
}) {
  const chartData = useMemo(
    () =>
      Object.entries(data)
        .map(([topic, count]) => ({
          topic,
          label: getTopicChartLabel(topic),
          count,
        }))
        .sort((a, b) => b.count - a.count),
    [data],
  );

  if (chartData.length === 0) {
    return <ChartEmptyState />;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, chartData.length * 28)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="label"
          width={140}
          tick={{ fontSize: 11 }}
        />
        <Tooltip />
        <Bar dataKey="count" fill="hsl(var(--primary))" name="Sessions" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ReachDistributionChart({
  data,
}: {
  data: SupervisorAnalyticsResponse["reachDistribution"];
}) {
  const chartData = useMemo(() => {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    if (total === 0) {
      return [];
    }
    return (
      Object.entries(REACH_DISTRIBUTION_LABELS) as Array<
        [keyof typeof REACH_DISTRIBUTION_LABELS, string]
      >
    ).map(([key, label]) => ({
      name: label,
      value: Math.round((data[key] / total) * 100),
      raw: data[key],
    }));
  }, [data]);

  if (chartData.length === 0) {
    return <ChartEmptyState />;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={({ name, value }) => `${name} ${value}%`}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value, _name, item) => [`${value}%`, item.payload.name]} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function SessionsByMonthChart({
  data,
}: {
  data: SupervisorAnalyticsResponse["sessionsByMonth"];
}) {
  const chartData = useMemo(
    () =>
      data.map((row) => ({
        ...row,
        label: formatMonthLabel(row.month),
      })),
    [data],
  );

  if (chartData.length === 0) {
    return <ChartEmptyState />;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="sessions"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          name="Sessions"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ReferralsByMonthChart({
  data,
}: {
  data: SupervisorAnalyticsResponse["referralsByMonth"];
}) {
  const chartData = useMemo(
    () =>
      data.map((row) => ({
        ...row,
        label: formatMonthLabel(row.month),
      })),
    [data],
  );

  if (chartData.length === 0) {
    return <ChartEmptyState />;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="referrals" fill="hsl(var(--primary))" name="Referrals" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function AnalyticsChartsComponent({ data }: AnalyticsChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Total reach by month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReachByMonthChart data={data.reachByMonth} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Sessions by topic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SessionsByTopicChart data={data.sessionsByTopic} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Reach distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReachDistributionChart data={data.reachDistribution} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Sessions per month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SessionsByMonthChart data={data.sessionsByMonth} />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Referrals per month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReferralsByMonthChart data={data.referralsByMonth} />
        </CardContent>
      </Card>
    </div>
  );
}

export const AnalyticsCharts = memo(AnalyticsChartsComponent);
