import React from 'react';
import { render, fireEvent, waitForElement, cleanup } from 'react-testing-library';
import '@babel/polyfill';
// import { act } from 'react-dom/test-utils';
import Todo from './todo';

// const sleep = async t => new Promise(resolve => setTimeout(resolve, t));

describe('#iostore', () => {
  afterEach(cleanup);
  test('#todo, click, add todo', async () => {
    const { getByTestId } = render(<Todo />);

    // first
    const todocount = getByTestId('todocount');
    expect(Number(todocount.textContent)).toEqual(1);
    console.log('todos count', todocount.textContent);

    const todolist = await waitForElement(() => getByTestId('todolist'));
    expect(todolist.innerHTML).toEqual('<li>first<span>DOING</span></li>');
    console.log('todolist html', todolist.innerHTML);

    // click
    console.log('====== click first todo start.');
    fireEvent.click(todolist.children[0]);
    // expect(todolist.innerHTML).toEqual('<li>first<span>COMPLETED</span></li>');
    console.log('todolist html', todolist.innerHTML);
    fireEvent.click(todolist.children[0]);
    expect(todolist.innerHTML).toEqual('<li>first<span>DOING</span></li>');
    console.log('====== click first todo end.');

    // add todo

    const todoinput = getByTestId('todoinput');
    todoinput.value = 'second';
    fireEvent.click(todoinput);
    const todobtn = getByTestId('todobtn');
    fireEvent.click(todobtn);
    console.log('click add toto button.');
    expect(todolist.innerHTML).toEqual(
      '<li>first<span>DOING</span></li><li>second<span>DOING</span></li>'
    );
    console.log('todos count', todocount.textContent);
    console.log('todolist html', todolist.innerHTML);
  });

  test('#copytodo, store changed.', async () => {
    const { getByTestId } = render(<Todo />);

    // first
    const todocount = getByTestId('todocount');
    expect(Number(todocount.textContent)).toEqual(2);
    console.log('todos count', todocount.textContent);

    const todolist = await waitForElement(() => getByTestId('todolist'));
    expect(todolist.innerHTML).toEqual(
      '<li>first<span>DOING</span></li><li>second<span>DOING</span></li>'
    );
    console.log('todolist html', todolist.innerHTML);
  });

  test('#async inc id, test loading', async () => {
    const { getByTestId } = render(<Todo />);

    const loading = getByTestId('incidloading');
    // async incid
    expect(Number(getByTestId('incid').textContent)).toEqual(0);
    expect(loading.innerHTML).toEqual('completed');
    fireEvent.click(getByTestId('incbtn'));
    expect(loading.innerHTML).toEqual('loading');
    await waitForElement(() => getByTestId('incidfinish'));
    expect(loading.innerHTML).toEqual('completed');
    expect(Number(getByTestId('incid').textContent)).toEqual(1);
    console.log('loading', loading.innerHTML);
    console.log('incid', getByTestId('incid').textContent);
  });

  test('#update null', async () => {
    const { getByTestId } = render(<Todo />);
    const nullbtn = getByTestId('nullbtn');
    fireEvent.click(nullbtn);
    expect(getByTestId('testNull').innerHTML).toEqual('testname');
  });
});
