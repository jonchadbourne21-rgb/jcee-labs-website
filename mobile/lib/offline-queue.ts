import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OfflineAction } from './types';
import { enqueueAction, loadQueue, retryQueue, type RetryResult } from './offline-queue-core';
import { api } from './api';
const actionId = (): string => `offline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
export const getOfflineActions = (): Promise<OfflineAction[]> => loadQueue(AsyncStorage);
export function queueNote(claimId: string, body: string): Promise<OfflineAction[]> { return enqueueAction(AsyncStorage, { id: actionId(), type: 'note', claimId, payload: { author_id: 'USR_FIELD_01', body, visibility: 'INTERNAL' }, createdAt: new Date().toISOString() }); }
export function queueTaskCompletion(claimId: string, taskId: string): Promise<OfflineAction[]> { return enqueueAction(AsyncStorage, { id: actionId(), type: 'task', claimId, taskId, payload: { actor_id: 'USR_FIELD_01' }, createdAt: new Date().toISOString() }); }
export function queuePhotoMetadata(claimId: string, payload: OfflineAction['payload']): Promise<OfflineAction[]> { return enqueueAction(AsyncStorage, { id: actionId(), type: 'photo_metadata', claimId, payload: payload as Extract<OfflineAction, { type: 'photo_metadata' }>['payload'], createdAt: new Date().toISOString() }); }
export const retryOfflineActions = (): Promise<RetryResult> => retryQueue(AsyncStorage, { addNote: api.addNote, completeTask: api.completeTask });
