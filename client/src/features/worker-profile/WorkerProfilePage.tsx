import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { WorkerPageShell } from "@/features/worker/layout/WorkerPageShell";
import { useLogout } from "@/hooks/use-logout";
import { useMe } from "@/hooks/use-me";
import type { Gender } from "@/lib/constants";
import {
  DISTRICT_OPTIONS,
  EDUCATION_OPTIONS,
  GENDER_OPTIONS,
  ORGANISATION_OPTIONS,
  VILLAGE_OPTIONS,
  WORKER_ROLE_OPTIONS,
} from "@/lib/constants";
import { isWorkerMe } from "@/lib/me";
import { getOptionLabel } from "@/lib/option-label";

type ProfileFieldProps = {
  label: string;
  value: string;
};

function ProfileField({ label, value }: ProfileFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base text-foreground">{value}</p>
    </div>
  );
}

function statusBadgeVariant(
  status: "pending" | "approved" | "rejected",
): "pending" | "approved" | "rejected" {
  return status;
}

export function WorkerProfilePage() {
  const navigate = useNavigate();
  const { data: me, isLoading } = useMe();
  const logout = useLogout();

  async function handleLogout() {
    await logout.mutateAsync();
    navigate("/login", { replace: true });
  }

  if (isLoading) {
    return (
      <WorkerPageShell title="Profile" backTo="/worker">
        <p className="text-base text-muted-foreground">Loading…</p>
      </WorkerPageShell>
    );
  }

  if (!me || !isWorkerMe(me)) {
    return (
      <WorkerPageShell title="Profile" backTo="/worker">
        <p className="text-base text-destructive" role="alert">
          Could not load profile.
        </p>
      </WorkerPageShell>
    );
  }

  const { worker } = me;
  const villageLabels = worker.villages
    .map((village) => getOptionLabel(VILLAGE_OPTIONS, village))
    .join(", ");

  return (
    <WorkerPageShell title="Profile" backTo="/worker">
      <div className="flex items-center gap-2">
        <Badge variant={statusBadgeVariant(worker.status)}>
          {worker.status === "pending"
            ? "Pending approval"
            : worker.status === "approved"
              ? "Approved"
              : "Rejected"}
        </Badge>
      </div>

      <div className="space-y-4 rounded-lg border border-border p-4">
        <ProfileField label="Name" value={me.name} />
        <ProfileField label="System ID" value={me.systemId} />
        <ProfileField label="Phone" value={me.phone} />
        <ProfileField
          label="Gender"
          value={getOptionLabel(GENDER_OPTIONS, me.gender as Gender)}
        />
        <ProfileField
          label="Organisation"
          value={
            me.organisation
              ? getOptionLabel(
                  ORGANISATION_OPTIONS,
                  me.organisation as (typeof ORGANISATION_OPTIONS)[number]["value"],
                )
              : "—"
          }
        />
        <ProfileField
          label="Worker role"
          value={getOptionLabel(WORKER_ROLE_OPTIONS, worker.workerRole)}
        />
        <ProfileField
          label="Education"
          value={getOptionLabel(EDUCATION_OPTIONS, worker.education)}
        />
        <ProfileField
          label="District"
          value={getOptionLabel(DISTRICT_OPTIONS, worker.district)}
        />
        <ProfileField label="Villages" value={villageLabels || "—"} />
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full"
        onClick={handleLogout}
        disabled={logout.isPending}
      >
        {logout.isPending ? "Signing out…" : "Sign out"}
      </Button>
    </WorkerPageShell>
  );
}
