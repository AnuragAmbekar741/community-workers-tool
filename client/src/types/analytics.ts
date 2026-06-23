import type { District, Topic } from "@/lib/constants";
import type { SessionDto } from "@/types/session";

export type AnalyticsFilters = {
  from?: string;
  to?: string;
  district?: District;
  workerId?: string;
  topic?: Topic;
  workerMonth?: string;
};

export type SupervisorAnalyticsWorkerRow = {
  workerId: string;
  district: District;
  totalSessions: number;
  topicsCovered: Topic[];
  totalReach: number;
  totalReferred: number;
  status: "pending" | "approved" | "rejected";
  lastSessionLog: string | null;
};

export type SupervisorAnalyticsResponse = {
  topBox: {
    totalSessions: number;
    totalReached: number;
    activeWorkers: number;
    totalWorkers: number;
    districtsCovered: number;
  };
  reachByMonth: Array<{ month: string; totalReached: number }>;
  sessionsByTopic: Record<string, number>;
  reachDistribution: {
    nWomen: number;
    nMen: number;
    nGirls: number;
    nBoys: number;
    nElders: number;
    nOthers: number;
  };
  sessionsByMonth: Array<{ month: string; sessions: number }>;
  referralsByMonth: Array<{ month: string; referrals: number }>;
  recentSubmissions: SessionDto[];
  workerTable: SupervisorAnalyticsWorkerRow[];
};
