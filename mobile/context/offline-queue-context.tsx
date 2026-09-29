import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { getOfflineActions, retryOfflineActions } from '@/lib/offline-queue';
import type { RetryResult } from '@/lib/offline-queue-core';
type OfflineQueueContextValue = { pendingCount: number; refreshPending: () => Promise<void>; retryPending: () => Promise<RetryResult> };
const OfflineQueueContext = createContext<OfflineQueueContextValue | undefined>(undefined);
export function OfflineQueueProvider({ children }: PropsWithChildren) {
  const [pendingCount, setPendingCount] = useState(0);
  const refreshPending = useCallback(async () => { setPendingCount((await getOfflineActions()).length); }, []);
  useEffect(() => { void refreshPending(); }, [refreshPending]);
  const retryPending = useCallback(async () => { const result = await retryOfflineActions(); await refreshPending(); return result; }, [refreshPending]);
  const value = useMemo(() => ({ pendingCount, refreshPending, retryPending }), [pendingCount, refreshPending, retryPending]);
  return <OfflineQueueContext.Provider value={value}>{children}</OfflineQueueContext.Provider>;
}
export function useOfflineQueue(): OfflineQueueContextValue { const context = useContext(OfflineQueueContext); if (!context) throw new Error('useOfflineQueue must be used inside OfflineQueueProvider.'); return context; }
