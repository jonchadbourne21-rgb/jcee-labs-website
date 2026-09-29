import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AEGIS ClaimOS",
    short_name: "AEGIS",
    description: "Evidence-to-authorization property claims operations workspace.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f5ef",
    theme_color: "#10233d",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
