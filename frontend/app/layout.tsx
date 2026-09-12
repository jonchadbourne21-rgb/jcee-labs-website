import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aegis ClaimOS | Autonomous property claims",
  description: "A guided property insurance claim lifecycle from intake to settlement."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
