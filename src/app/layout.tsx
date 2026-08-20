import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MotionDirector } from "@/components/motion-director";
import { JsonLd } from "@/components/json-ld";
import { organizationSchema } from "@/data/site";

export const metadata: Metadata = {
  metadataBase: new URL("https://kwartierwest.be"),
  applicationName: "Kwartier West",
  authors: [{ name: "Kwartier West" }],
  creator: "Kwartier West",
  publisher: "Kwartier West",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/assets/icons/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/assets/icons/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/assets/icons/apple-touch-icon.png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050505",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body>
        <a className="skip" href="#main">Ga naar inhoud</a>
        <JsonLd data={organizationSchema} />
        <SiteHeader />
        {children}
        <SiteFooter />
        <MotionDirector />
      </body>
    </html>
  );
}
