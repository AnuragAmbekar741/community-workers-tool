import type { ReactNode } from "react";

import { Badge } from "@/components/base/badge";
import {
  formatSessionDate,
  formatSessionDistrict,
  formatSessionTopic,
} from "@/lib/session-format";
import type { SessionDto } from "@/types/session";

type DetailSectionProps = {
  title: string;
  children: ReactNode;
};

function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <section className="rounded-lg border border-border bg-muted/30 p-4">
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

type DetailFieldProps = {
  label: string;
  value: string;
};

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base text-foreground">{value}</p>
    </div>
  );
}

type ParticipantStatProps = {
  label: string;
  value: number;
};

function ParticipantStat({ label, value }: ParticipantStatProps) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

type SessionDetailSectionsProps = {
  session: SessionDto;
};

export function SessionDetailSections({ session }: SessionDetailSectionsProps) {
  return (
    <div className="space-y-4">
      <DetailSection title="Overview">
        <div className="space-y-3">
          <DetailField
            label="Date"
            value={formatSessionDate(session.sessionDate)}
          />
          <DetailField
            label="District"
            value={formatSessionDistrict(session)}
          />
          <DetailField label="Topic" value={formatSessionTopic(session)} />
          <DetailField
            label="Duration"
            value={`${session.durationMin} minutes`}
          />
        </div>
      </DetailSection>

      <DetailSection title="Participants">
        <div className="grid grid-cols-2 gap-2">
          <ParticipantStat label="Women" value={session.nWomen} />
          <ParticipantStat label="Men" value={session.nMen} />
          <ParticipantStat label="Girls" value={session.nGirls} />
          <ParticipantStat label="Boys" value={session.nBoys} />
          <ParticipantStat label="Elders" value={session.nElders} />
          <ParticipantStat label="Others" value={session.nOthers} />
        </div>
        <div className="mt-3 flex items-center justify-between rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
          <span className="text-sm font-medium text-muted-foreground">
            Total reached
          </span>
          <span className="text-xl font-bold tabular-nums text-primary">
            {session.totalReached}
          </span>
        </div>
      </DetailSection>

      <DetailSection title="Referrals">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Referrals made
            </span>
            <Badge variant={session.referralsMade ? "approved" : "outline"}>
              {session.referralsMade ? "Yes" : "No"}
            </Badge>
          </div>
          {session.referralsMade ? (
            <>
              <DetailField
                label="Number of referrals"
                value={String(session.nReferrals)}
              />
              <DetailField
                label="Reason for referral"
                value={session.referralReason?.trim() || "—"}
              />
            </>
          ) : null}
        </div>
      </DetailSection>

      <DetailSection title="Notes">
        <p className="text-base whitespace-pre-wrap text-foreground">
          {session.keyIssues?.trim() || "—"}
        </p>
      </DetailSection>
    </div>
  );
}
