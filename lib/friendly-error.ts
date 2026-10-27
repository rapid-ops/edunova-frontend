export function friendlyError(e: unknown, fallback: string): string {
  const err = e as { code?: string; response?: { status?: number; data?: { error?: unknown } } };
  const res = err?.response;
  const msg = res?.data?.error;
  if (typeof msg === 'string' && msg) return msg;
  if (err?.code === 'ECONNABORTED') return 'The server is taking too long to answer. Please wait a moment and try again.';
  if (!res) return 'We could not reach the server. Please check your internet connection and try again.';
  if (res.status === 401) return 'Your session has ended. Please log in again.';
  if (res.status === 403) return 'You do not have permission to do this.';
  return fallback;
}
