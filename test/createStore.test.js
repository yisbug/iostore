import { createStore } from '../src/index';

describe('#createStore', () => {
  test('none namespace', () => {
    const createStoreNoNs = () => {
      createStore({
        name: 'test',
      });
    };
    expect(createStoreNoNs).toThrow('Invalid params, namespace is required.');
  });

  test('now allow loading', () => {
    const createStoreNoNs = () => {
      createStore({
        namespace: 'testStore',
        loading: false,
      });
    };
    expect(createStoreNoNs).toThrow('loading is not allowd in params.');
  });

  test('now allow stores', () => {
    const createStoreNoNs = () => {
      createStore({
        namespace: 'testStore',
        stores: {},
      });
    };
    expect(createStoreNoNs).toThrow('stores is not allowd in params.');
  });

  test('now allow useStore', () => {
    const createStoreNoNs = () => {
      createStore({
        namespace: 'testStore',
        useStore: () => {},
      });
    };
    expect(createStoreNoNs).toThrow('useStore is not allowd in params.');
  });

  test('now allow modify update', () => {
    const createStoreNoNs = () => {
      return createStore({
        namespace: 'testStore',
        name: 'test',
      });
    };
    const store = createStoreNoNs();

    const setName = () => {
      store.name = 'hello';
      return 'hello';
    };
    expect(setName()).toEqual('hello');
  });
});
