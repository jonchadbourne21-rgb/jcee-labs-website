import type { OfflineAction } from './types';

export const OFFLINE_QUEUE_KEY = 'aegis.claimos.offline-actions.v1';
export interface StorageLike { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void>; }
export interface QueueTransport { addNote(claimId: string, payload: { author_id: string; body: string; visibility: string }): Promise<unknown>; completeTask(claimId: string, taskId: string, payload: { actor_id: string }): Promise<unknown>; }
export async function loadQueue(storage: StorageLike): Promise<OfflineAction[]> { const raw = await storage.getItem(OFFLINE_QUEUE_KEY); if (!raw) return []; try { const parsed: unknown = JSON.parse(raw); return Array.isArray(parsed) ? parsed as OfflineAction[] : []; } catch { return []; } }
export async function saveQueue(storage: StorageLike, actions: OfflineAction[]): Promise<void> { await storage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(actions)); }
export async function enqueueAction(storage: StorageLike, action: OfflineAction): Promise<OfflineAction[]> { const next = [...await loadQueue(storage), action]; await saveQueue(storage, next); return next; }
export type RetryResult = { attempted: number; delivered: number; retained: number; photoMetadataPending: number };
export async function retryQueue(storage: StorageLike, transport: QueueTransport): Promise<RetryResult> {
  const retained: OfflineAction[] = []; let attempted = 0; let delivered = 0; let photoMetadataPending = 0;
  for (const action of await loadQueue(storage)) {
    if (action.type === 'photo_metadata') { retained.push(action); photoMetadataPending += 1; continue; }
    attempted += 1;
    try { if (action.type === 'note') await transport.addNote(action.claimId, action.payload); else await transport.completeTask(action.claimId, action.taskId, action.payload); delivered += 1; }
    catch { retained.push(action); }
  }
  await saveQueue(storage, retained); return { attempted, delivered, retained: retained.length, photoMetadataPending };
}
