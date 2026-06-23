import type { District, Topic } from "@/lib/constants";

export type CreateSessionRequest = {
  sessionDate: string;
  district: District;
  topic: Topic;
  topicOther?: string;
  durationMin: number;
  nWomen: number;
  nMen: number;
  nGirls: number;
  nBoys: number;
  nElders: number;
  nOthers: number;
  keyIssues?: string;
  referralsMade: boolean;
  nReferrals: number;
  referralReason?: string;
};

export type SessionDto = {
  sessionId: string;
  workerId: string;
  sessionDate: string;
  district: District;
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
  referralsMade: boolean;
  nReferrals: number;
  referralReason: string | null;
  createdAt: string;
};

export type ListSessionsResponse = {
  sessions: SessionDto[];
};

export type GetSessionResponse = {
  session: SessionDto;
};

export type CreateSessionResponse = {
  session: SessionDto;
};

export type SessionDistrictFilter = District | "all";
