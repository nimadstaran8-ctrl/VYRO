/**
 * Change notification for the local image stores (product image storage and
 * the media library). Stores emit events when images are added, replaced,
 * deleted or finished hydrating from IndexedDB; the app and pages subscribe
 * so views re-render with the freshly available image URLs.
 */

type ImageStoreListener = () => void;

const listeners = new Set<ImageStoreListener>();
let version = 0;

export function notifyImageStoreChanged(): void {
  version += 1;
  listeners.forEach((listener) => listener());
}

export function subscribeToImageStoreChanges(listener: ImageStoreListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getImageStoreVersion(): number {
  return version;
}
