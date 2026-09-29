import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AEGIS ClaimOS | Property claims operations", template: "%s | AEGIS ClaimOS" },
  description: "A high-contrast evidence-to-authorization workspace for property claims operations.",
  manifest: "/manifest.webmanifest",
  applicationName: "AEGIS ClaimOS",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "AEGIS ClaimOS" },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/favicon.ico", sizes: "32x32" }], apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }] },
};

export const viewport: Viewport = { themeColor: "#10233d", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
