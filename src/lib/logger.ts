export function logError(event: string, error: unknown, context: Record<string, unknown> = {}) {
  const message = error instanceof Error ? error.message : String(error);
  // Keep errors in host logs without serializing request bodies, tokens, or secrets.
  console.error(JSON.stringify({ level: 'error', event, message, ...context, at: new Date().toISOString() }));
}
