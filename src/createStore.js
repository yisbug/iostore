import { isPromise, isUndefined, addProxy, isFunction } from './util';
import { broadcast } from './pub';
import stores from './stores';
import useStore from './useStore';

const disableProps = ['loading', 'stores', 'useStore'];

export default config => {
  const { namespace = '', helper = {}, ...rest } = config;

  if (!namespace) {
    throw new Error('Invalid params, namespace is required.');
  }
  disableProps.forEach(key => {
    if (!isUndefined(rest[key])) {
      throw new Error(`${key} is not allowd in params.`);
    }
  });

  const reducers = {};
  const state = {};
  Object.keys(rest).forEach(key => {
    if (isFunction(rest[key])) {
      reducers[key] = rest[key];
    } else {
      state[key] = rest[key];
    }
  });

  let isChanged = false;

  const checkReducersStatus = name => {
    const keys = Object.keys(reducers);
    for (let i = 0; i < keys.length; i++) {
      if (service[keys[i]][name]) return true;
    }
    return false;
  };

  const handler = {
    set(target, prop, newValue) {
      if (!checkReducersStatus('unlock')) {
        console.error(
          'Do not modify data within components, call a method of service to update the data.'
        );
      }
      if (target[prop] !== newValue) isChanged = true;
      target[prop] = addProxy(newValue, handler);
      return true;
    },
  };

  let service = {
    namespace,
    stores,
    useStore,
    helper: {},
    get loading() {
      return checkReducersStatus('loading');
    },
    ...state,
  };

  const checkUpdateAndBroadcast = () => {
    if (isChanged) {
      broadcast(namespace, Math.random());
    }
  };

  Object.keys(helper).forEach(key => {
    service.helper[key] = (...args) => helper[key].apply(service, args);
  });
  Object.keys(reducers).forEach(key => {
    service[key] = (...args) => {
      service[key].unlock = true;
      const promise = reducers[key].apply(service, args);
      if (isPromise(promise)) {
        isChanged = true;
        service[key].loading = true;
        service[key].unlock = true;
        promise.finally(() => {
          isChanged = true;
          service[key].loading = false;
          service[key].unlock = false;
          checkUpdateAndBroadcast();
        });
        checkUpdateAndBroadcast();
      } else {
        checkUpdateAndBroadcast();
        service[key].unlock = false;
      }
      return promise;
    };
    service[key].loading = false;
    service[key].unlock = false;
  });

  service = addProxy(service, handler);
  stores[namespace] = service;
  return service;
};
