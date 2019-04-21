import { createModel } from '../src/index';
const sleep = t => {
  return new Promise(resolve => {
    setTimeout(resolve, t);
  });
};

export default createModel('person', {
  state: {
    count: 0,
    name: 'lilei',
    firstName: 'lei',
    lastName: 'li'
  },
  reducers: {
    inc(a, b, c) {
      return {
        count: this.state.count + 1
      };
    },
    async asyncInc() {
      await sleep(1000);
      return {
        count: this.state.count + 1
      };
    }
  },
  helper: {
    getFullName() {
      const { firstName, lastName } = this.state;
      return 'my full name is :' + firstName + lastName;
    }
  }
});
