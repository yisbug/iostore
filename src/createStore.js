import { isPromise, isUndefined, addProxy, isFunction } from './util';
import { broadcast } from './pub';
import stores from './stores';
import useStore from './useStore';

const disableProps = ['loading', 'stores', 'useStore'];

export default config => {
  const { namespace = '', ...rest } = config;
  let service;
  let isChanged = false;

  const reducers = {};
  const state = { namespace };

  if (!namespace) {
    throw new Error('Invalid params, namespace is required.');
  }
  if (stores[namespace]) {
    return stores[namespace];
  }
  disableProps.forEach(key => {
    if (!isUndefined(rest[key])) {
      throw new Error(`${key} is not allowd in params.`);
    }
  });

  Object.keys(rest).forEach(key => {
    if (isFunction(rest[key])) {
      reducers[key] = rest[key];
    } else {
      state[key] = rest[key];
    }
  });

  const checkReducersStatus = name => {
    const keys = Object.keys(reducers);
    for (let i = 0; i < keys.length; i++) {
      if (service[keys[i]][name]) return true;
    }
    return false;
  };

  const handler = {
    set(target, prop, newValue) {
      if (disableProps.includes(prop) || isFunction(newValue)) {
        target[prop] = newValue;
        return true;
      }
      if (!checkReducersStatus('unlock')) {
        console.error(
          'Do not modify data within components, call a method of service to update the data.',
          `namespace:${namespace}, prop:${prop}, value:${newValue}`
        );
      }
      if (target[prop] !== newValue) {
        isChanged = true;
      }
      target[prop] = addProxy(newValue, handler);
      return true;
    },
  };
  service = addProxy(state, handler);

  const checkUpdateAndBroadcast = () => {
    if (isChanged) {
      isChanged = false;
      broadcast(namespace, Math.random());
    }
  };

  Object.keys(reducers).forEach(key => {
    // 将所有方法(通常会改变state)设置成异步代码
    // 这样子组件的effect即使比父组件的effect先执行(react hook rule)
    // 方法还是会等父组件的effect先执行完再执行
    // 这样不会出现数据改变时, queue为空的情况
    service[key] = async (...args) => {
      service[key].unlock = true;
      const promise = await reducers[key].apply(service, args);
      if (!isPromise(promise)) {
        service[key].unlock = false;
        checkUpdateAndBroadcast();
        return promise;
      }
      isChanged = true;
      service[key].loading = true;
      checkUpdateAndBroadcast();
      return new Promise((resolve, reject) => {
        promise
          .then(resolve)
          .catch(reject)
          .finally(() => {
            isChanged = true;
            service[key].loading = false;
            service[key].unlock = false;
            checkUpdateAndBroadcast();
          });
      });
    };
    service[key].loading = false;
    service[key].unlock = false;
  });

  Object.defineProperty(service, 'loading', {
    get() {
      return checkReducersStatus('loading');
    },
  });

  Object.assign(service, {
    stores,
    useStore: () => useStore()[namespace],
  });

  stores[namespace] = service;
  return service;
};
