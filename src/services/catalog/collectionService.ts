import type { Collection } from '../../types';
import { collections as mockCollections } from '../../data/mock/collections';

export function getCollections(): Collection[] {
  return mockCollections;
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return mockCollections.find((c) => c.slug === slug);
}
