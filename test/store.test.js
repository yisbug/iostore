import store from '../src/store';

describe('#store', () => {
  test('not exists store', () => {
    const createStoreNoNs = () => {
      return store.notExistsStore;
    };
    expect(createStoreNoNs).toThrow('Not found the store: notExistsStore.');
  });
});
