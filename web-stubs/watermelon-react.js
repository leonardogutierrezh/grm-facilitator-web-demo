/**
 * Web-only replacement for `@nozbe/watermelondb/react`.
 *
 * The real package wires React up to a live WatermelonDB instance. In this demo
 * build there is no local database, so:
 *  - `DatabaseProvider` is a passthrough,
 *  - `useDatabase()` returns the no-op fake database,
 *  - the observable HOCs are identity wrappers.
 */
import React from 'react';
import { fakeDatabase } from './fakeDatabase';

export function DatabaseProvider({ children }) {
  return React.createElement(React.Fragment, null, children);
}

export function useDatabase() {
  return fakeDatabase;
}

export function withDatabase(Component) {
  return Component;
}

export function withObservables() {
  return (Component) => Component;
}

export default { DatabaseProvider, useDatabase, withDatabase, withObservables };
