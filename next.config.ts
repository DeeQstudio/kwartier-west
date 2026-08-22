import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://challenges.cloudflare.com https://caster04.streampakket.com; frame-src https://challenges.cloudflare.com https://live.villabota.be; media-src 'self' https://caster04.streampakket.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; manifest-src 'self'; upgrade-insecure-requests" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  compress: true,
  turbopack: {
    root: process.cwd(),
  },

  async redirects() {
    return [
      { source: "/:path*", destination: "https://kwartierwest.be/:path*", permanent: true, has: [{"type": "host", "value": "www.kwartierwest.be"}] },
      { source: "/pages/tekno/index.html", destination: "/tekno", permanent: true },
      { source: "/pages/tekno/", destination: "/tekno", permanent: true },
      { source: "/pages/hiphop/index.html", destination: "/hiphop", permanent: true },
      { source: "/pages/hiphop/", destination: "/hiphop", permanent: true },
      { source: "/pages/events/index.html", destination: "/events", permanent: true },
      { source: "/pages/archive/index.html", destination: "/archive", permanent: true },
      { source: "/pages/booking/index.html", destination: "/booking", permanent: true },
      { source: "/pages/booking/verify/index.html", destination: "/booking/verifieer", permanent: true },
      { source: "/pages/partners/index.html", destination: "/partners", permanent: true },
      { source: "/pages/contact/index.html", destination: "/contact", permanent: true },
      { source: "/pages/manifest/index.html", destination: "/manifest", permanent: true },
      { source: "/pages/privacy/index.html", destination: "/privacy", permanent: true },
      { source: "/pages/voorwaarden/index.html", destination: "/voorwaarden", permanent: true },
      { source: "/pages/tickets/index.html", destination: "/events", permanent: true },
      { source: "/pages/shop/index.html", destination: "/", permanent: true },
      { source: "/pages/tekno/artist/:slug/index.html", destination: "/artiesten/:slug", permanent: true },
      { source: "/pages/tekno/artist/:slug", destination: "/artiesten/:slug", permanent: true },
      { source: "/pages/hiphop/artist/:slug/index.html", destination: "/artiesten/:slug", permanent: true },
      { source: "/pages/hiphop/artist/:slug", destination: "/artiesten/:slug", permanent: true },
      { source: "/pages/events/detail/villa-west-radio-2026/:rest*", destination: "/events/villa-west-2026", permanent: true },
      { source: "/pages/events/detail/tek-teknorelics-eye-of-the-temple-2026-03-28/:rest*", destination: "/events/teknorelics-eye-of-the-temple", permanent: true }
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
