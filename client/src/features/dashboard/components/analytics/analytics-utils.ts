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

export const CHART_COLORS = [
  "hsl(var(--primary))",
  "#2563eb",
  "#16a34a",
  "#ca8a04",
  "#9333ea",
  "#0891b2",
];
