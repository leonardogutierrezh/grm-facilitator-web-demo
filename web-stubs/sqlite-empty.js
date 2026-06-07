/**
 * Web-only empty stand-in for native-only SQLite modules
 * (`react-native-sqlite-storage` and `@nozbe/watermelondb/adapters/sqlite`).
 * These are never used on web because the local database is disabled.
 */
function noop() {}

// react-native-sqlite-storage surface used by storageManager on native.
export const enablePromise = noop;
export const openDatabase = noop;

// @nozbe/watermelondb/adapters/sqlite default export is the adapter class.
export default class SQLiteAdapterStub {
  constructor() {}
}
