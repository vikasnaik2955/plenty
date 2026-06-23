/**
 * Data-access boundary. Screens never import mock data directly — they read
 * through this interface, so a real backend can be dropped in later by writing
 * an `ApiRepository implements PlentyRepository` and changing `repository` below.
 */
import { MOCK_DATA } from './mock';
import type { PlentyData } from './types';

export interface PlentyRepository {
  /** Load the full dataset (one call on app start; mock resolves immediately). */
  fetchAll(): Promise<PlentyData>;
}

/** Deep clone so the in-memory store can mutate freely without touching the seed. */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export class MockRepository implements PlentyRepository {
  async fetchAll(): Promise<PlentyData> {
    return clone(MOCK_DATA);
  }
}

/**
 * The single repository instance the app uses.
 * To go live: `export const repository: PlentyRepository = new ApiRepository(baseUrl);`
 */
export const repository: PlentyRepository = new MockRepository();
