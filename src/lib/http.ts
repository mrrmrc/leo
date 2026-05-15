const DEFAULT_BASE_PATH = '/leo';

function normalizeBasePath(basePath: string): string {
  if (!basePath || basePath === '/') {
    return '';
  }

  return basePath.startsWith('/') ? basePath.replace(/\/$/, '') : `/${basePath.replace(/\/$/, '')}`;
}

export const APP_BASE_PATH = normalizeBasePath(
  process.env.NEXT_PUBLIC_BASE_PATH || DEFAULT_BASE_PATH,
);

export function buildAppPath(path: string): string {
  if (!path.startsWith('/')) {
    return `${APP_BASE_PATH}/${path}`;
  }

  return `${APP_BASE_PATH}${path}`;
}

export function getPhpApiCandidates(endpoint: string): string[] {
  return [
    buildAppPath(`/api/${endpoint}.php`),
    buildAppPath(`/api/${endpoint}/`),
    `/api/${endpoint}.php`,
    `/api/${endpoint}/`,
  ];
}

export async function postJsonWithFallback<T>(paths: string[], body: unknown): Promise<T> {
  let lastError: Error | null = null;

  for (const path of paths) {
    try {
      const response = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        lastError = new Error(`Request failed for ${path} with status ${response.status}`);
        continue;
      }

      return await response.json() as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown request error');
    }
  }

  throw lastError ?? new Error('All fallback endpoints failed');
}

export async function getJsonWithFallback<T>(paths: string[]): Promise<T> {
  let lastError: Error | null = null;

  for (const path of paths) {
    try {
      const response = await fetch(path, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        lastError = new Error(`Request failed for ${path} with status ${response.status}`);
        continue;
      }

      return await response.json() as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown request error');
    }
  }

  throw lastError ?? new Error('All fallback endpoints failed');
}

export function extractAssistantText(payload: unknown): string {
  if (typeof payload === 'string') {
    return payload.trim();
  }

  if (!payload || typeof payload !== 'object') {
    return '';
  }

  const text = (payload as { text?: unknown }).text;
  if (typeof text === 'string') {
    return text.trim();
  }

  const message = (payload as { message?: unknown }).message;
  if (typeof message === 'string') {
    return message.trim();
  }

  const choices = (payload as { choices?: Array<{ message?: { content?: string } }> }).choices;
  if (Array.isArray(choices)) {
    return choices[0]?.message?.content?.trim() || '';
  }

  return '';
}
