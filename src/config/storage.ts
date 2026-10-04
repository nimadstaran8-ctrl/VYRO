/**
 * Soft storage budget for locally-stored image binaries (IndexedDB).
 * Browsers typically allow far more (hundreds of MB to GB depending on free
 * disk space), but the app enforces this budget to keep the library manageable.
 */
export const IMAGE_STORAGE_BUDGET = 200 * 1024 * 1024; // 200 MB total

/** Maximum size of a single uploaded image file. */
export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per file
