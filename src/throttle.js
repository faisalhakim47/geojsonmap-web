/**
 * - throttle function call
 * - always execute latest call
 * - execute first call instantly
 *
 * @template T
 * @param {T extends Function} fn
 * @param {number} duration in milliseconds
 * @returns {T}
 */
export function throttle(fn, duration) {
  let timeoutId = undefined;
  let latestCallTime = 0;
  return function (...args) {
    const now = Date.now();
    if ((now - latestCallTime) > duration) {
      fn(...args);
      latestCallTime = now;
    }
    else {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(function () {
        fn(...args);
        timeoutId = undefined;
        latestCallTime = Date.now();
      }, duration);
    }
  };
}
