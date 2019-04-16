### react-hooks-model

用 redux 的流程太复杂了，看着就晕。

看着 react 16.8 新出的 hooks api 蛮好玩的，随便撸了一个简单的 model 用于数据管理，组件之间可以方便的共享数据。

支持 action 级别和 model 级别的 loading。

### Useage

```js
// model.js
import {createModel} from 'react-hooks-model';
export default createModel({
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

// component.js
import React from 'react';
import { useModel,isLoading } from './model';

export default () => {
  const [state, actions] = useModel();
  console.log(`render Person, count: ${state.count}, name: ${state.name}`);
  const loading = isLoading(); // model级别的loading
  // action 级别的 loading： actions.asyncInc.loading
  return (
    <div>
      <span>{state.count}</span>
      <span>{String(loading)}</span>
      <span>{String(actions.asyncInc.loading)}</span>
      <button onClick={() => actions.inc('a', 'b', 'c')}>btn1</button>
      <button
        onClick={async () => {
          await actions.asyncInc();
          console.log('exec actions.asyncInc() done!');
        }}
      >
        btn2
      </button>
    </div>
  );
};
```

### License

MIT
