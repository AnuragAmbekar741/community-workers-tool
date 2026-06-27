export type RegisterLoginLocationState = {
  registeredSystemId?: string;
};

export function getRegisteredSystemIdFromState(
  state: unknown,
): string | undefined {
  if (!state || typeof state !== "object") {
    return undefined;
  }

  const { registeredSystemId } = state as RegisterLoginLocationState;

  if (typeof registeredSystemId !== "string" || !registeredSystemId.trim()) {
    return undefined;
  }

  return registeredSystemId.trim();
}
