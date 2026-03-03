function envString(name, fallback = "") {
  return String(process.env[name] ?? fallback).trim();
}

function envBool(name, fallback = false) {
  const raw = envString(name, fallback ? "true" : "false").toLowerCase();
  return ["1", "true", "yes", "on"].includes(raw);
}

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const supabaseUrl = envString("NEXT_PUBLIC_SUPABASE_URL") || envString("SUPABASE_URL");
  const supabaseAnonKey = envString("NEXT_PUBLIC_SUPABASE_ANON_KEY") || envString("SUPABASE_ANON_KEY");
  const turnstileSiteKey = envString("NEXT_PUBLIC_TURNSTILE_SITE_KEY") || envString("TURNSTILE_SITE_KEY");
  const authEnabled = Boolean(supabaseUrl && supabaseAnonKey);
  const bookingVerificationEnabled = envBool("BOOKING_EMAIL_VERIFICATION_ENABLED", true);

  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300");
  return res.status(200).json({
    ok: true,
    authEnabled,
    bookingVerificationEnabled,
    turnstileEnabled: Boolean(turnstileSiteKey),
    turnstileSiteKey: turnstileSiteKey || "",
    supabase: {
      url: supabaseUrl || "",
      anonKey: supabaseAnonKey || ""
    }
  });
}
