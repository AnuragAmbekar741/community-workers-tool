import type { Topic, Village } from "@/lib/constants";

export type SessionDto = {
  sessionId: string;
  workerId: string;
  sessionDate: string;
  village: Village;
  topic: Topic;
  topicOther: string | null;
  durationMin: number;
  nWomen: number;
  nMen: number;
  nGirls: number;
  nBoys: number;
  nElders: number;
  nOthers: number;
  totalReached: number;
  keyIssues: string | null;
  createdAt: string;
};

export type ListSessionsResponse = {
  sessions: SessionDto[];
};

export type SessionVillageFilter = Village | "all";
