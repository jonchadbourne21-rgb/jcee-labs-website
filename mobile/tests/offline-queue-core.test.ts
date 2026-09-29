import { describe, expect, it } from 'vitest';
import { enqueueAction, loadQueue, retryQueue, type StorageLike } from '../lib/offline-queue-core';
import type { OfflineAction } from '../lib/types';
function memoryStorage(): StorageLike { let value: string | null = null; return { getItem: async () => value, setItem: async (_key, next) => { value = next; } }; }
const note: OfflineAction = { id: '1', type: 'note', claimId: 'CLM_1', payload: { author_id: 'USR_FIELD_01', body: 'Drywall is damp.', visibility: 'INTERNAL' }, createdAt: '2026-09-12T00:00:00Z' };
const photo: OfflineAction = { id: '2', type: 'photo_metadata', claimId: 'CLM_1', payload: { fileName: 'kitchen.jpg', mimeType: 'image/jpeg', uri: 'file://kitchen.jpg', width: 100, height: 100 }, createdAt: '2026-09-12T00:00:00Z' };
describe('offline queue core', () => {
  it('persists and reloads queued actions', async () => { const storage = memoryStorage(); await enqueueAction(storage, note); expect(await loadQueue(storage)).toEqual([note]); });
  it('retries server actions while retaining unsupported photo metadata', async () => { const storage = memoryStorage(); await enqueueAction(storage, note); await enqueueAction(storage, photo); const result = await retryQueue(storage, { addNote: async () => undefined, completeTask: async () => undefined }); expect(result).toEqual({ attempted: 1, delivered: 1, retained: 1, photoMetadataPending: 1 }); expect(await loadQueue(storage)).toEqual([photo]); });
  it('retains actions that still fail delivery', async () => { const storage = memoryStorage(); await enqueueAction(storage, note); const result = await retryQueue(storage, { addNote: async () => { throw new Error('offline'); }, completeTask: async () => undefined }); expect(result.retained).toBe(1); expect(await loadQueue(storage)).toEqual([note]); });
});
