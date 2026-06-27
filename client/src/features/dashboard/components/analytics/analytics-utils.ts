import { getOptionLabel } from "@/lib/option-label";
import { TOPIC_OPTIONS } from "@/lib/constants";
import type { Topic } from "@/lib/constants";

export function getTopicChartLabel(topic: string): string {
  if (topic === "other") {
    return "Other";
  }
  return getOptionLabel(TOPIC_OPTIONS, topic as Topic);
}

export function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split("-").map(Number);
  if (!year || !monthNum) {
    return month;
  }
  return new Date(year, monthNum - 1, 1).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

export const REACH_DISTRIBUTION_LABELS = {
  nWomen: "Women",
  nMen: "Men",
  nGirls: "Girls",
  nBoys: "Boys",
  nElders: "Elders",
  nOthers: "Others",
} as const;

/** Fixed light pastel per calendar month (Jan–Dec). */
export const MONTH_CHART_COLORS = [
  "#93c5fd", // Jan — light blue
  "#fda4af", // Feb — light rose
  "#86efac", // Mar — light green
  "#fcd34d", // Apr — light amber
  "#c4b5fd", // May — light violet
  "#7dd3fc", // Jun — light sky
  "#fdba74", // Jul — light orange
  "#a5f3fc", // Aug — light cyan
  "#d8b4fe", // Sep — light purple
  "#bef264", // Oct — light lime
  "#fbcfe8", // Nov — light pink
  "#bae6fd", // Dec — light sky blue
] as const;

/** Light pastels for reach distribution pie (order matches REACH_DISTRIBUTION_LABELS). */
export const PIE_CHART_COLORS = [
  "#fda4af", // Women — light rose
  "#93c5fd", // Men — light blue
  "#c4b5fd", // Girls — light violet
  "#7dd3fc", // Boys — light sky
  "#fdba74", // Elders — light peach
  "#86efac", // Others — light mint
] as const;

/** Light pastels cycled for sessions-by-topic bars. */
export const TOPIC_CHART_COLORS = [
  "#93c5fd",
  "#86efac",
  "#fcd34d",
  "#c4b5fd",
  "#fda4af",
  "#7dd3fc",
  "#fdba74",
  "#bae6fd",
  "#d8b4fe",
  "#bef264",
] as const;

export function getMonthChartColor(month: string): string {
  const [, monthNumStr] = month.split("-");
  const monthNum = Number(monthNumStr);

  if (!monthNum || monthNum < 1 || monthNum > 12) {
    return MONTH_CHART_COLORS[0];
  }

  return MONTH_CHART_COLORS[monthNum - 1];
}

export function buildMonthlyChartRows<T extends { month: string }>(
  data: T[],
): Array<T & { label: string; fill: string }> {
  return data.map((row) => ({
    ...row,
    label: formatMonthLabel(row.month),
    fill: getMonthChartColor(row.month),
  }));
}

export function collectSortedUniqueMonths(months: string[]): string[] {
  return [...new Set(months)].sort();
}
