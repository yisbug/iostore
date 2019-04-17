import { createModel } from '../index';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import '@babel/polyfill';

configure({ adapter: new Adapter() });
import { shallow, mount } from 'enzyme';

const sleep = t =>
  new Promise(resolve => {
    setTimeout(resolve, t);
  });

const model = createModel({
  state: {
    count: 0,
    name: 'test'
  },
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
});

const { useModel, isLoading } = model;

const Person = () => {
  const [state, actions] = useModel();
  const loading = isLoading(); // model级别的loading
  // action 级别的 loading： actions.asyncInc.loading
  console.log(
    `render Person, count: ${state.count}, name: ${state.name}`,
    loading,
    actions.asyncInc.loading
  );
  return (
    <div>
      <span>{state.count}</span>
      <span>{String(loading)}</span>
      <span>{String(actions.asyncInc.loading)}</span>
      <button
        onClick={() => {
          console.log('click inc.');
          actions.inc('a', 'b', 'c');
        }}
      >
        btn1
      </button>
      <button
        onClick={() => {
          console.log('click async inc start.');
          actions.asyncInc().then(() => {
            console.log('exec actions.asyncInc() done!');
          });
        }}
      >
        btn2
      </button>
    </div>
  );
};

const PersonA = () => {
  const [state, actions] = useModel();
  console.log('render PersonA, count:', state.count);

  return (
    <div>
      <span>{state.count}</span>
      <button onClick={() => actions.inc()}>btn1</button>
    </div>
  );
};

describe('useModel', () => {
  it('Person, PersonA', async () => {
    let wrapper = null;

    wrapper = mount(<Person />);

    const buttons = wrapper.find('button');
    const html = () =>
      wrapper
        .find('span')
        .at(0)
        .html();
    const log = () => console.log(html());
    const text = () =>
      wrapper
        .find('span')
        .at(0)
        .text();
    const assertCount = val => expect(text()).toEqual(val);
    const assertLoading = bool =>
      expect(
        wrapper
          .find('span')
          .at(1)
          .text()
      ).toEqual(String(bool));

    const click = index => buttons.at(index).simulate('click');
    const logLoading = () =>
      console.log(
        wrapper
          .find('span')
          .at(1)
          .html()
      );

    // log();
    assertCount('0');
    click(0);
    // log();
    assertCount('1');
    // 等生命周期函数执行完毕
    await sleep(100);
    click(1);
    assertLoading(true);
    // logLoading();
    await sleep(1100);
    // log();
    // logLoading();
    assertLoading(false);
    assertCount('2');

    let copy = mount(<PersonA />);
    copy
      .find('button')
      .at(0)
      .simulate('click');

    assertLoading(false);
    assertCount('3');
  });
});
