import { TOPIC_OPTIONS, DISTRICT_OPTIONS } from "@/lib/constants";
import { getOptionLabel } from "@/lib/option-label";
import type { SessionDto } from "@/types/session";

export function formatSessionDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) {
    return date;
  }

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatSessionTopic(session: SessionDto): string {
  if (session.topic === "other" && session.topicOther?.trim()) {
    return session.topicOther.trim();
  }

  return getOptionLabel(TOPIC_OPTIONS, session.topic);
}

export function formatSessionDistrict(session: SessionDto): string {
  return getOptionLabel(DISTRICT_OPTIONS, session.district);
}
