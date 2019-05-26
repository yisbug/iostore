### iostore

由原 `react-hooks-model` 更名为 `iostore`。

极简的全局数据管理方案，忘掉 `redux`、`state`、`reducer`、`action`、`observer` 这些复杂的概念吧。

[背景介绍](docs/about.md)

[![NPM version](https://img.shields.io/npm/v/iostore.svg?style=flat)](https://npmjs.org/package/iostore)
[![build status](https://img.shields.io/travis/yisbug/iostore.svg?style=flat-square)](https://travis-ci.org/yisbug/iostore)
[![Test coverage](https://img.shields.io/codecov/c/github/yisbug/iostore.svg?style=flat-square)](https://codecov.io/gh/yisbug/iostore)
[![Known Vulnerabilities](https://snyk.io/test/npm/iostore/badge.svg)](https://snyk.io/test/npm/iostore)
[![David deps](https://img.shields.io/david/yisbug/iostore.svg?style=flat-square)](https://david-dm.org/yisbug/iostore)

### 特性

- 总计只有 100 多行代码。
- 只需要学会两个 `API` 即可使用，非常简单：`createStore()`、`useStore()`。
- 像普通的 `js` 对象一样定义 `store`。
- 像普通的 `js` 对象一样使用数据和方法。
- `store` 定义的方法内部可任意修改数据，可直接返回数据，支持同步、异步方法。
- 当数据发生变化时，自动触发组件渲染。基于`React Hooks API`，实现了完整的单向数据流。
- 集成异步方法的执行状态管理，目前最优雅的`loading`状态解决方案之一。
- `store` 内部方法可以使用`this.stores.TodoStore`访问其他的 `store` 示例，实现更复杂的数据交互。

和之前的方案相比：

- 不再区分 `state`, `reducer`, `helper`，去掉了这些概念，更简单。
- 定义 `store` 就像定义一个普通的 `js object` 一样，只需要传入一个 `namespace` 用于区分不同的 `store`。
- 基于 `Proxy` 重新设计，数据变化，则自动通知组件，重新渲染。

### TODO

- [ ] TypeScript 支持
- [ ] 支持 Vuejs
- [ ] 更多的测试用例

### 如何使用

安装：

```shell
npm install iostore
// or
yarn add iostore
```

### API

引入

```js
import { createStore, useStore } from 'iostore';
```

#### createStore(params)

定义一个 store。参数：

普通的 js 对象，必须指定一个`namespace`。

```js
// TodoStore.js
import { createStore } from 'iostore';
createStore({
  namespace: 'TodoStore',
  todos: [],
  getTodoCount() {
    return this.todos.length;
  },
  getNs() {
    return this.namespace;
  },
  ...rest, // 其余自定义的数据和方法
});

// UserStore.js
import { createStore } from 'iostore';
createStore({
  namespace: 'UserStore',
  // 访问其他 store 的方法。
  getTodoCount() {
    return this.stores.TodoStore.getTodoCount();
  },
  ...rest, // 其余自定义的数据和方法
});
```

#### useStore()

在 `React` 函数式组件中引入所需 `store`。 无参数。
得益于 ES6 中的解构赋值语法，我们从该方法的返回值中，单独声明所需的 store。

> 框架会在 `store` 中注入 `stores` 对象，用来访问其他 `store` 的数据。
> 一般来说，只推荐访问其他 `store` 的计算数据，不要访问其他 `store` 中可能导致修改数据的方法。
> 如果需要修改其他 `store` 的数据，请在逻辑层/组件内处理。

如下：

```js
const Todo = () => {
  const { TodoStore } = useStore();
  // 之后便可以自由的使用 TodoStore 中定义的方法了。
  const ns = TodoStore.getNs();
  return <div>{ns}</div>;
};
```

#### 关于 loading

在对交互要求较高的场景下，获取异步方法的执行状态是非常必要的。

例如显示一个 `loading` 页面告诉用户正在加载数据，按钮上显示一个`loading`样式提示用户该按钮已经被点击。

当你使用`iostore`时，这一切变得非常简单。

我们可以非常容易的获取到每一个异步方法的`loading`状态，甚至可以获取到一个`store`下有没有异步方法正在执行。

- 获取`store`中有没有异步方法正在执行：`Store.loading`，返回 `true/false`
- 获取`store`中某个异步方法的 loading 状态：`Store.asyncFunction.loading`，返回 `true/false`

示例如下：

```js
// 定义 store
createStore({
  namespace: 'TodoStore',
  id: 0,
  async inc() {
    await sleep(1000 * 5);
    this.id++;
  },
});

// 获取 loading 状态
const Todo = () => {
  const { TodoStore } = useStore();
  const handleClick = () => TodoStore.inc();
  // TodoStore.loading  store 级别的 loading 状态
  // TodoStore.inc.loading 某个异步方法的 loading 状态
  return (
    <button loading={TodoStore.inc.loading} onClick={handleClick}>
      submit
    </button>
  );
};
```

### 完整的 Todo 示例

```js
// TodoStore.js
import store, { createStore, useStore } from 'iostore';
export default createStore({
  namespace: 'TodoStore', // store 命名空间
  id: 0,
  todos: [
    {
      id: 0,
      content: 'first',
      status: 'DOING',
    },
  ],
  addTodo(content) {
    this.id++;
    const todo = {
      id: this.id,
      content,
      status: 'DOING',
    };
    this.todos.push(todo);
  },
  getTodoById(id) {
    return this.todos.filter(item => item.id === id)[0];
  },
  updateTodo(id, status) {
    const todo = this.getTodoById(id);
    if (!todo) return;
    todo.status = status;
  },
  // test async function
  incId: 0,
  async delayIncId() {
    await sleep(1000 * 3);
    this.incId++;
  },
});

// Todos.js
import React, { useRef } from 'react';
import store, { createStore, useStore } from '../src/index';
import todoStore from './TodoStore';

export default () => {
  /**
   * 获取 TodoStore 的几种方式：
   * const { TodoStore } = useStore(); // 更符合 React Hooks 的理念
   * const { TodoStore } = store;
   * const TodoStore = todoStore.useStore();
   */
  const { TodoStore } = useStore();
  const inputEl = useRef(null);
  const handleClick = item => {
    if (item.status === 'DOING') {
      TodoStore.updateTodo(item.id, 'COMPLETED');
    } else if (item.status === 'COMPLETED') {
      TodoStore.updateTodo(item.id, 'DOING');
    }
  };
  const handleAddTodo = () => {
    console.warn('set data within component, should be got console.error : ');
    TodoStore.todos[0].id = 1000;
    const text = inputEl.current.value;
    if (text) {
      TodoStore.addTodo(text);
    }
  };
  console.log('render', 'totos.length:' + TodoStore.todos.length);
  return (
    <div>
      <div data-testid="incid">{TodoStore.incId}</div>
      {!TodoStore.delayIncId.loading ? <div data-testid="incidfinish" /> : ''}

      <div data-testid="incidloading">{TodoStore.delayIncId.loading ? 'loading' : 'completed'}</div>
      <div data-testid="todocount">{TodoStore.todos.length}</div>
      <ul data-testid="todolist">
        {TodoStore.todos.map(item => {
          return (
            <li onClick={() => handleClick(item)} key={item.id}>
              {item.content}
              <span>{item.status}</span>
            </li>
          );
        })}
      </ul>
      <input ref={inputEl} data-testid="todoinput" type="text" />
      <button data-testid="todobtn" onClick={() => handleAddTodo()}>
        add todo
      </button>

      <button data-testid="incbtn" onClick={() => TodoStore.delayIncId()}>
        delay inc id
      </button>
    </div>
  );
};
```

### License

MIT
