import { fetchJSONWithTimeout, resolveEndpoint } from "./integration-client.js";

let cache = null;
let cacheKey = "";

export async function loadPublicConfig({ baseDepth = 0, revalidate = false } = {}) {
  const endpoint = resolveEndpoint("/api/public-config", baseDepth);
  if (!revalidate && cache && cacheKey === endpoint) {
    return cache;
  }

  try {
    const data = await fetchJSONWithTimeout(endpoint, {
      timeoutMs: 7000,
      cache: "no-store"
    });
    if (data && typeof data === "object") {
      cache = data;
      cacheKey = endpoint;
      return data;
    }
  } catch {
    // ignore and return fallback below
  }

  return {
    ok: false,
    authEnabled: false,
    bookingVerificationEnabled: true,
    turnstileEnabled: false,
    turnstileSiteKey: "",
    supabase: { url: "", anonKey: "" }
  };
}
