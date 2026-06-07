/**
 * Generic empty stub for native-only modules that must not be bundled on web.
 * Returns a Proxy so any property access / call is a harmless no-op, covering
 * the various shapes (default export, named exports, chained builders) that
 * such modules expose.
 */
const noop = () => handler.proxy;

const handler = {};
const proxy = new Proxy(noop, {
  get: () => proxy,
  apply: () => proxy,
});
handler.proxy = proxy;

module.exports = proxy;
module.exports.default = proxy;
