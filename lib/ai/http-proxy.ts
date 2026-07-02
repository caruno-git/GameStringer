/**
 * POST JSON verso URL esterni (provider LLM cloud) senza incappare nel CORS del
 * webview Tauri. In Tauri instrada dal comando Rust `http_post_json`; in browser/dev
 * usa la fetch diretta. L'oggetto restituito è "fetch-like" (ok/status/json/text)
 * così i call-site cambiano di poche righe. Sostituisce il vecchio /api/llm-proxy.
 */

export interface HttpLikeResponse {
  ok: boolean;
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: () => Promise<any>;
  text: () => Promise<string>;
}

function isTauri(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!(
      (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ ||
      (window as unknown as Record<string, unknown>).__TAURI_IPC__
    )
  );
}

export async function httpPostJson(
  url: string,
  headers: Record<string, string>,
  body: string,
  timeoutMs?: number,
): Promise<HttpLikeResponse> {
  if (isTauri()) {
    const { invoke } = await import('@tauri-apps/api/core');
    const res = await invoke<{ status: number; ok: boolean; body: string }>('http_post_json', {
      url,
      headers,
      body,
      timeoutMs,
    });
    return {
      ok: res.ok,
      status: res.status,
      json: async () => JSON.parse(res.body),
      text: async () => res.body,
    };
  }

  // Browser / dev: fetch diretta (Response è già "fetch-like").
  return fetch(url, {
    method: 'POST',
    headers,
    body,
    signal: timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined,
  });
}
