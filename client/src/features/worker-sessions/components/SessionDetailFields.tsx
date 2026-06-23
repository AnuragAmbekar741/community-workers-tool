import {
  formatSessionDate,
  formatSessionDistrict,
  formatSessionTopic,
} from "@/lib/session-format";
import type { SessionDto } from "@/types/session";

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

type SessionDetailFieldsProps = {
  session: SessionDto;
  showWorkerId?: boolean;
};

export function SessionDetailFields({
  session,
  showWorkerId = false,
}: SessionDetailFieldsProps) {
  return (
    <>
      {showWorkerId ? (
        <DetailField label="Session ID" value={session.sessionId} />
      ) : null}
      {showWorkerId ? (
        <DetailField label="Worker ID" value={session.workerId} />
      ) : null}
      <DetailField
        label="Date"
        value={formatSessionDate(session.sessionDate)}
      />
      <DetailField label="District" value={formatSessionDistrict(session)} />
      <DetailField label="Topic" value={formatSessionTopic(session)} />
      <DetailField
        label="Duration"
        value={`${session.durationMin} minutes`}
      />
      <DetailField label="Women" value={String(session.nWomen)} />
      <DetailField label="Men" value={String(session.nMen)} />
      <DetailField label="Girls" value={String(session.nGirls)} />
      <DetailField label="Boys" value={String(session.nBoys)} />
      <DetailField label="Elders" value={String(session.nElders)} />
      <DetailField label="Others" value={String(session.nOthers)} />
      <DetailField
        label="Total reached"
        value={String(session.totalReached)}
      />
      <DetailField
        label="Referrals made"
        value={session.referralsMade ? "Yes" : "No"}
      />
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
      <DetailField
        label="Notes"
        value={session.keyIssues?.trim() || "—"}
      />
    </>
  );
}
