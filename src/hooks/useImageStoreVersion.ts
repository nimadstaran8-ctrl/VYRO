import { useSyncExternalStore } from 'react';
import {
  getImageStoreVersion,
  subscribeToImageStoreChanges,
} from '../lib/imageEvents';

/**
 * Re-renders the calling component whenever a local image store changes
 * (hydration from IndexedDB, uploads, deletions). Pages that cache product or
 * media lists in state/memo can also use the returned version as a dependency.
 */
export function useImageStoreVersion(): number {
  return useSyncExternalStore(subscribeToImageStoreChanges, getImageStoreVersion, getImageStoreVersion);
}
