import { createModel, useModel, useLoading } from '../src/index';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import '@babel/polyfill';

import './person.model';

configure({ adapter: new Adapter() });
import { shallow, mount } from 'enzyme';

const sleep = t => {
  return new Promise(resolve => {
    setTimeout(resolve, t);
  });
};

const Person = () => {
  const [state, person] = useModel('person');
  const loading = useLoading('person'); // model级别的loading
  // action 级别的 loading： person.asyncInc.loading
  const { count, name } = state;
  console.log(
    `render Person, count: ${count}, name: ${name}，loading:${loading}，asyncInc.loading:${
      person.asyncInc.loading
    }`
  );

  return (
    <div>
      <span>{state.count}</span>
      <span>{String(loading)}</span>
      <span>{String(person.asyncInc.loading)}</span>
      <span>{person.helper.getFullName()}</span>
      <button
        onClick={() => {
          console.log('click inc.');
          person.inc('a', 'b', 'c');
        }}
      >
        btn1
      </button>
      <button
        onClick={() => {
          console.log('click async inc start.');
          person.asyncInc();
        }}
      >
        btn2
      </button>
    </div>
  );
};

const PersonA = () => {
  const [state, person] = useModel('person');
  console.log('render PersonA, count:', state.count);

  return (
    <div>
      <span>{state.count}</span>
      <button onClick={() => person.inc()}>btn1</button>
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
    // click(0);
    // log();
    assertCount('1');
    // 等生命周期函数执行完毕
    await sleep(100);
    click(1);
    await sleep(100);
    assertLoading(true);
    await sleep(1100);
    // log();
    // logLoading();
    assertLoading(false);
    assertCount('2');

    expect(
      wrapper
        .find('span')
        .at(3)
        .text()
    ).toEqual('my full name is :leili');

    let copy = mount(<PersonA />);
    copy
      .find('button')
      .at(0)
      .simulate('click');

    assertLoading(false);
    assertCount('3');
  });
});
