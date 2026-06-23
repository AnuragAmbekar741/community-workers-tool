import { Button } from "@/components/base/button";
import { isApiError } from "@/lib/api-error";

type SessionsLoadErrorProps = {
  error: unknown;
  onRetry: () => void;
};

function getErrorMessage(error: unknown): string {
  if (!isApiError(error)) {
    return "Could not load sessions. Please try again.";
  }

  if (error.status === 0) {
    return "Could not reach the server. Check your internet connection and that the API URL is configured correctly.";
  }

  if (error.status === 401) {
    return "Your session has expired. Redirecting to login…";
  }

  return error.message;
}

export function SessionsLoadError({ error, onRetry }: SessionsLoadErrorProps) {
  const message = getErrorMessage(error);
  const showRetry = !isApiError(error) || error.status !== 401;

  return (
    <div
      className="mx-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-base text-destructive md:mx-6"
      role="alert"
    >
      <p>{message}</p>
      {showRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={onRetry}
        >
          Try again
        </Button>
      ) : null}
    </div>
  );
}
