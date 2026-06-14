export function getOptionLabel<T extends string>(
  options: ReadonlyArray<{ value: T; label: string }>,
  value: T | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  return options.find((option) => option.value === value)?.label ?? value;
}
