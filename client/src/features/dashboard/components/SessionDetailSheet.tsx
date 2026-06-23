import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/base/sheet";
import { SessionDetailFields } from "@/features/worker-sessions/components/SessionDetailFields";
import { useAdminSession } from "@/hooks/use-admin-session";
import { useSupervisorSession } from "@/hooks/use-supervisor-session";
import { isApiError } from "@/lib/api-error";

type SessionDetailSheetProps = {
  role: "supervisor" | "admin";
  sessionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SessionDetailSheet({
  role,
  sessionId,
  open,
  onOpenChange,
}: SessionDetailSheetProps) {
  const id = sessionId ?? "";
  const supervisorQuery = useSupervisorSession(id);
  const adminQuery = useAdminSession(id);
  const { data, isLoading, isError, error } =
    role === "supervisor" ? supervisorQuery : adminQuery;

  const session = data?.session;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle>Session details</SheetTitle>
          <SheetDescription>
            {session?.sessionId ?? sessionId ?? "—"}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <p className="px-4 text-base text-muted-foreground">Loading…</p>
        ) : null}

        {isError || (!isLoading && !session) ? (
          <div
            className="mx-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-base text-destructive"
            role="alert"
          >
            {isApiError(error)
              ? error.message
              : "Session not found or you do not have access."}
          </div>
        ) : null}

        {session ? (
          <div className="space-y-4 px-4 pb-4">
            <SessionDetailFields session={session} showWorkerId />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
