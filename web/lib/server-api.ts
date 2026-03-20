import { ApiError, type Agent, type LogEntry } from "./api";
import { proxyFetch } from "./proxy";

async function serverApiFetch<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => search.set(key, String(value)));
  const suffix = search.toString() ? `?${search.toString()}` : "";

  const response = await proxyFetch(`${path}${suffix}`);

  if (!response.ok) {
    throw new ApiError(response.status, `API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const serverApi = {
  getAgent: (agentId: string) => serverApiFetch<Agent>(`/agents/${agentId}`),
  getAgentLogs: (agentId: string, params?: Record<string, string | number | boolean>) =>
    serverApiFetch<{ items: LogEntry[]; total: number }>(`/agents/${agentId}/logs`, params)
};
