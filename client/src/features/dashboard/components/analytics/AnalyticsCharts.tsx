import { memo, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import type { AnalyticsResponse } from "@/types/analytics";

import {
  buildMonthlyChartRows,
  getTopicChartLabel,
  PIE_CHART_COLORS,
  REACH_DISTRIBUTION_LABELS,
  TOPIC_CHART_COLORS,
} from "./analytics-utils";
import { ChartEmptyState } from "./ChartEmptyState";
import { MonthChartLegend } from "./MonthChartLegend";

const VERTICAL_BAR_CHART_MARGIN = { top: 8, right: 16, left: 0, bottom: 0 };

const CHART_GRID_PROPS = {
  strokeDasharray: "3 3",
  stroke: "var(--border)",
};

const COUNT_Y_AXIS_PROPS = {
  allowDecimals: false,
  domain: [0, "dataMax"] as [number, string],
  tick: { fontSize: 12 },
};

type AnalyticsChartsProps = {
  data: AnalyticsResponse;
};

function ReachByMonthChart({
  data,
}: {
  data: AnalyticsResponse["reachByMonth"];
}) {
  const chartData = useMemo(() => buildMonthlyChartRows(data), [data]);

  if (chartData.length === 0) {
    return <ChartEmptyState />;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={VERTICAL_BAR_CHART_MARGIN}>
        <CartesianGrid {...CHART_GRID_PROPS} />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis {...COUNT_Y_AXIS_PROPS} />
        <Tooltip />
        <Bar dataKey="totalReached" name="Reached">
          {chartData.map((row) => (
            <Cell key={row.month} fill={row.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function SessionsByTopicChart({
  data,
}: {
  data: AnalyticsResponse["sessionsByTopic"];
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
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 8, left: 8, right: 16, bottom: 0 }}
      >
        <CartesianGrid {...CHART_GRID_PROPS} />
        <XAxis
          type="number"
          allowDecimals={false}
          domain={[0, "dataMax"]}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={140}
          tick={{ fontSize: 11 }}
        />
        <Tooltip />
        <Bar dataKey="count" name="Sessions">
          {chartData.map((row, index) => (
            <Cell
              key={row.topic}
              fill={TOPIC_CHART_COLORS[index % TOPIC_CHART_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function ReachDistributionChart({
  data,
}: {
  data: AnalyticsResponse["reachDistribution"];
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
              fill={PIE_CHART_COLORS[index]}
              stroke="#ffffff"
              strokeWidth={2}
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
  data: AnalyticsResponse["sessionsByMonth"];
}) {
  const chartData = useMemo(() => buildMonthlyChartRows(data), [data]);

  if (chartData.length === 0) {
    return <ChartEmptyState />;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={VERTICAL_BAR_CHART_MARGIN}>
        <CartesianGrid {...CHART_GRID_PROPS} />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis {...COUNT_Y_AXIS_PROPS} />
        <Tooltip />
        <Bar dataKey="sessions" name="Sessions">
          {chartData.map((row) => (
            <Cell key={row.month} fill={row.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function ReferralsByMonthChart({
  data,
}: {
  data: AnalyticsResponse["referralsByMonth"];
}) {
  const chartData = useMemo(() => buildMonthlyChartRows(data), [data]);

  if (chartData.length === 0) {
    return <ChartEmptyState />;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={VERTICAL_BAR_CHART_MARGIN}>
        <CartesianGrid {...CHART_GRID_PROPS} />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis {...COUNT_Y_AXIS_PROPS} />
        <Tooltip />
        <Bar dataKey="referrals" name="Referrals">
          {chartData.map((row) => (
            <Cell key={row.month} fill={row.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function AnalyticsChartsComponent({ data }: AnalyticsChartsProps) {
  const legendMonths = useMemo(
    () => [
      ...data.reachByMonth.map((row) => row.month),
      ...data.sessionsByMonth.map((row) => row.month),
      ...data.referralsByMonth.map((row) => row.month),
    ],
    [data.reachByMonth, data.sessionsByMonth, data.referralsByMonth],
  );

  return (
    <div className="space-y-4">
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

      <MonthChartLegend months={legendMonths} />
    </div>
  );
}

export const AnalyticsCharts = memo(AnalyticsChartsComponent);
