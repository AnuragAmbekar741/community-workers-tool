import { describe, expect, it } from "vitest";

import {
  buildMonthlyChartRows,
  collectSortedUniqueMonths,
  getMonthChartColor,
  MONTH_CHART_COLORS,
} from "./analytics-utils";

describe("getMonthChartColor", () => {
  it("uses the same color for the same calendar month across years", () => {
    expect(getMonthChartColor("2024-03")).toBe(getMonthChartColor("2025-03"));
  });

  it("uses different colors for different calendar months", () => {
    expect(getMonthChartColor("2024-03")).not.toBe(getMonthChartColor("2024-04"));
  });

  it("falls back to January color for invalid input", () => {
    expect(getMonthChartColor("invalid")).toBe(MONTH_CHART_COLORS[0]);
    expect(getMonthChartColor("2024-00")).toBe(MONTH_CHART_COLORS[0]);
    expect(getMonthChartColor("2024-13")).toBe(MONTH_CHART_COLORS[0]);
  });
});

describe("buildMonthlyChartRows", () => {
  it("attaches label and fill from month key", () => {
    const rows = buildMonthlyChartRows([
      { month: "2024-03", sessions: 5 },
      { month: "2024-04", sessions: 2 },
    ]);

    expect(rows[0].fill).toBe(getMonthChartColor("2024-03"));
    expect(rows[1].fill).toBe(getMonthChartColor("2024-04"));
    expect(rows[0].label).toContain("2024");
    expect(rows[0].sessions).toBe(5);
  });
});

describe("collectSortedUniqueMonths", () => {
  it("deduplicates and sorts months chronologically", () => {
    expect(
      collectSortedUniqueMonths([
        "2024-06",
        "2024-03",
        "2024-03",
        "2023-12",
      ]),
    ).toEqual(["2023-12", "2024-03", "2024-06"]);
  });
});
