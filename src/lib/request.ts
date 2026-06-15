/**
 * Reject cross-site state-changing requests. For cookie-authenticated POSTs we
 * require the Origin (or Referer) host to match the request host. This is a
 * lightweight CSRF guard on top of SameSite cookies.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  if (!host) return false;

  const source = origin || referer;
  // No Origin/Referer (e.g. some same-origin server-to-server) — allow.
  if (!source) return true;

  try {
    return new URL(source).host === host;
  } catch {
    return false;
  }
}
