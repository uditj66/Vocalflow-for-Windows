import { deepgramConfig } from "@/config/deepgram.config";

type DeepgramFetchInit = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string | undefined>;
};

export function getDeepgramApiKey(): string {
  if (!deepgramConfig.apiKey) {
    throw new Error("Missing API Key in config file");
  }
  return deepgramConfig.apiKey;
}

export function hasDeepgramApiKey(): boolean {
  return Boolean(deepgramConfig.apiKey);
}

export async function deepgramFetch(
  path: string,
  init: DeepgramFetchInit = {},
): Promise<Response> {
  const apiKey = getDeepgramApiKey();
  const url = path.startsWith("http")
    ? path
    : `https://api.deepgram.com${path.startsWith("/") ? "" : "/"}${path}`;

  const headers: Record<string, string> = {
    Authorization: `Token ${apiKey}`,
    ...(init.headers ?? {}),
  };

  return fetch(url, { ...init, headers });
}

export type DeepgramProject = {
  project_id: string;
  name?: string;
};

export async function getDeepgramProjectId(): Promise<string> {
  if (deepgramConfig.projectId) {
    return deepgramConfig.projectId;
  }

  const res = await deepgramFetch("/v1/projects");
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Deepgram projects request failed (${res.status}): ${text}`,
    );
  }

  const data = (await res.json()) as { projects?: DeepgramProject[] };
  const first = data.projects?.[0]?.project_id;
  if (!first) throw new Error("No Deepgram projects found for this API key.");
  return first;
}
