type ChartEmptyStateProps = {
  message?: string;
};

export function ChartEmptyState({
  message = "No data for selected filters.",
}: ChartEmptyStateProps) {
  return (
    <div className="flex h-[240px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
      {message}
    </div>
  );
}
