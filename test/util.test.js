import { isPromise, addProxy } from '../src/util';
import '@babel/polyfill';

describe('#util', () => {
  test('isPromise', () => {
    const sleep = async t =>
      new Promise(resolve => {
        setTimeout(resolve, t);
      });
    expect(isPromise(sleep(1))).toEqual(true);

    const fn = {};
    fn.then = () => {};
    expect(isPromise(fn)).toEqual(true);
  });

  test('addProxy', () => {
    const state = {
      state: {
        todos: [],
        info: {
          name: 'test',
        },
      },
    };
    const proxy = addProxy(state, {
      set(target, prop, newValue) {
        if (prop === 'name') {
          target[prop] = 'test';
        } else {
          target[prop] = newValue;
        }
        return true;
      },
    });

    proxy.state.info.name = 'test1';
    expect(proxy.state.info.name).toEqual('test');
  });
});
