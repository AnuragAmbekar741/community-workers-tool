let handler: (() => void) | null = null;

export function registerUnauthorizedHandler(fn: () => void) {
  handler = fn;
}

export function onUnauthorized() {
  handler?.();
}
