import { useMe } from "@/hooks/use-me";

export function WorkerHomeStubPage() {
  const { data: user } = useMe();

  return (
    <main className="mx-auto min-h-dvh max-w-sm space-y-4 p-4">
      <h1 className="text-2xl font-semibold">Welcome</h1>

      {user?.name ? (
        <p className="text-base text-muted-foreground">Hello, {user.name}</p>
      ) : null}

      <div
        className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-base text-amber-950"
        role="status"
      >
        Awaiting admin approval — you cannot log sessions yet.
      </div>
    </main>
  );
}
