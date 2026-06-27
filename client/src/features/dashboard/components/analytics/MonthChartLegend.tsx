import {
  collectSortedUniqueMonths,
  formatMonthLabel,
  getMonthChartColor,
} from "./analytics-utils";

type MonthChartLegendProps = {
  months: string[];
};

export function MonthChartLegend({ months }: MonthChartLegendProps) {
  const uniqueMonths = collectSortedUniqueMonths(months);

  if (uniqueMonths.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="mb-3 text-sm font-medium text-foreground">
        Month colors (shared across monthly charts)
      </p>
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {uniqueMonths.map((month) => (
          <li key={month} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-3 shrink-0 rounded-sm"
              style={{ backgroundColor: getMonthChartColor(month) }}
            />
            <span className="text-sm text-muted-foreground">
              {formatMonthLabel(month)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
