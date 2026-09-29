"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function PwaRegister() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const updateStatus = () => setOffline(!navigator.onLine);
    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (!offline) return null;
  return <div role="status" className="fixed inset-x-3 bottom-20 z-50 mx-auto flex max-w-xl items-start gap-3 border border-safety bg-orange-50 p-3 text-sm text-ink shadow-lg"><WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-safety" /><span><strong>Offline mode:</strong> the AEGIS workspace shell is available, but claim data and actions require reconnection. Authoritative API responses are never stored offline.</span></div>;
}
