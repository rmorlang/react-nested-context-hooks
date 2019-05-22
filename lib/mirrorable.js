import { useMemo } from 'react';

const mirrorables = new WeakMap();

export default function makeMirrorable(obj, graph) {
  let functions = mirrorables.get(obj);
  if (!functions) {
    functions = {};
    mirrorables.set(obj, functions);
  }
  let index = 0;

  function createSignalFunction(selectorFn) {
    return (callback) => {
      index += 1;
      const key = index;
      functions[key] = callback;
      return (...args) => {
        const targets = selectorFn(graph).map(o => mirrorables.get(o));
        const fns = targets.map(t => t[key]);
        fns.forEach(fn => fn && fn(...args));
      };
    };
  }

  function createSignal(selectorFn) {
    const signal = createSignalFunction(selectorFn);
    return fn => useMemo(() => signal(fn), [fn]);
  }

  return createSignal;
}
