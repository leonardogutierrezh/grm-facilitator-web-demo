/**
 * Web-only stub that stands in for the WatermelonDB `Database` instance.
 *
 * This demo build drops the offline local database entirely; all data is read
 * from / written to the remote API. The few places that still reach for the
 * WatermelonDB instance (local repositories, the `useDatabase()` hook in a
 * couple of screens) get this harmless no-op so nothing crashes and every read
 * resolves to an empty result, leaving the remote path as the single source of
 * truth.
 */

function makeQueryResult() {
  // Local repos do `await db.get(table).query(...)` and treat the result as an
  // array (.length/.map/.slice). The observe-based screens do
  // `db.get(table).query().observeWithColumns([...]).subscribe(cb)`.
  // So the query result must be an array AND expose observe helpers.
  const arr = [];
  const noopSubscription = { subscribe: () => ({ unsubscribe() {} }) };
  arr.observe = () => noopSubscription;
  arr.observeWithColumns = () => noopSubscription;
  arr.observeCount = () => noopSubscription;
  arr.fetch = async () => [];
  arr.fetchCount = async () => 0;
  return arr;
}

function makeCollection() {
  return {
    query: () => makeQueryResult(),
    // `find` rejects so upsert() falls through to its create branch, which we
    // make a harmless echo of the incoming raw data.
    find: async () => {
      throw new Error('[web-stub] record not found (no local database)');
    },
    create: async (builder) => {
      const placeholder = { _raw: {} };
      try {
        if (typeof builder === 'function') builder(placeholder);
      } catch (_e) {
        /* ignore builder errors against the stub */
      }
      return placeholder;
    },
    prepareCreate: (builder) => {
      const placeholder = { _raw: {} };
      try {
        if (typeof builder === 'function') builder(placeholder);
      } catch (_e) {
        /* ignore */
      }
      return placeholder;
    },
  };
}

export const fakeDatabase = {
  get: () => makeCollection(),
  collections: { get: () => makeCollection() },
  write: async (work) => (typeof work === 'function' ? await work() : undefined),
  read: async (work) => (typeof work === 'function' ? await work() : undefined),
  batch: async () => {},
};

export default fakeDatabase;
