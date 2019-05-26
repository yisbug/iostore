import { addProxy } from './util';
import stores from './stores';
import useReactHooks from './useReactHooks';
export default addProxy(
  {},
  {
    get(target, key) {
      if (!stores[key]) throw new Error(`Not found the store: ${key}.`);
      useReactHooks(key);
      return stores[key];
    },
  }
);
