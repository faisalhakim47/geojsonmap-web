/**
 * @template T
 * @param {any} value
 * @param {new (...args: any[]) => T} type
 * @return {asserts value is T}
 */
export function assertType(value, type) {
  if (value instanceof type) {
    return;
  }
  throw new Error(`Expected ${value} to be ${type.name}`);
}
