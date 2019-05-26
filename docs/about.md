# 极简的数据管理方案 iostore

### 背景

之前写过一篇文章，简单的介绍了一个思路，主要是利用 `React Hooks API` 的特性做一个全局的数据管理方案，并且写了一个简单的 `demo`，随后丢到了 `Github` 上。

这段时间基于这个 `demo` 结合 `antd-design-pro` 做了几个实际的项目，又接入了一些旧的项目。具体的业务场景包括：登陆、登出、基于 `nodejs` 后端 `RESTFul` 的接口的增删改查、表单、搜索、多个 `store` 之间交互（产品、产品分类）、数组转 `treeNode`、权限管理控制 等等，可以说大部分场景都有所应用。

总体来说，开发体验确实蛮爽的。定义好 `store` 的数据接口和方法，组件里引入 `store`，剩下的代码就是一把梭，畅快无比。

主要是没有思想负担了，想改数据？看一眼 `store` 文件，直接调用对应接口。想获取数据？同样，看一眼就知道了。看完之后怎么用？`store` 里怎么定义的就怎么用啊，不需要 `dispatch,commit`，直接像原生方法一样调用就可以了。

**而且，等后续支持了 TypeScript 就会更爽。**

其实本来是不会有这篇文章的，之前那个 `demo` 也可能会像以前搞的若干烂尾项目一样被人遗忘。因代码很少，自己的 `React` 项目需要用的话就复制一份，方便，改起来也容易。其次，如果思路清晰的话，开发这样的一个小工具库也挺简单的，如果只是简单的造轮子那就快速撸一个好了。但如果开源到 `Github` ，还是需要花不少精力来维护的，所以这也是一个阻力。

这段时间，之前发布的文章到现在也有一些赞和探讨，也有一些方案借鉴了这个思路，例如阿里的 https://github.com/ice-lab/icestore ，其 README.md 中提到的 `react-hooks-model` 便是本人提供的思路。尽管如此，我在 `Github` 上搜索了一下，还是很少有类似思路的方案实现的数据管理库，有些要么实现过于复杂，有些思路就不太一样，比较可惜，都无法达到我想要的极简的开发体验：包体积够小、开箱即用、没有复杂概念、定义数据就可以直接使用数据。

此外，近期接手了一个 `vuejs` 的项目，使用了 `vuex` 的方案。这个代码，写起来真叫一个繁琐，各种 `dispatch，commit`，再加上使用 `TypeScript` 的不当姿势，最终的代码看起来简直不忍直视，拖沓无比。尤其在 `React` 中使用过我自制的方案后，更觉得无法忍受 `vuex` 这个模式。这个项目想重构成 `React` 是不太可能了，目前项目已经非常大，够复杂了。于是呼，仔细想了一下是否可以把这个数据方案移植到 `vuejs` 的项目中，感觉是完全可行的，尤大本人也写了一个实验性质的库：https://github.com/yyx990803/vue-hooks 。

既然如此，那就说干就干吧，反正头发也没了。

第一步，现梳理现有的代码，修复之前的 `bug`，进一步简化 `API`，并做了一些简单的约定，例如不允许在 `store` 外部修改数据。

基于以上，于是就有了 `iostore` 的第一个版本，简介：

**极简的全局数据管理方案，忘掉 `redux`、`state`、`reducer`、`action`、`observer` 这些复杂的概念吧。**

### 特性

- 总计只有 100 多行代码。
- 只需要学会两个 API 即可使用，非常简单：`createStore()`、`useStore()`。
- 像普通的 `js` 对象一样定义 `store`。
- 像普通的 `js` 对象一样使用数据和方法。
- `store` 定义的方法内部可任意修改数据，可直接返回数据，支持同步、异步方法。
- 当数据发生变化时，自动触发组件渲染。基于 `React Hooks API`，实现了单向数据流。
- 集成异步方法的执行状态管理，目前最优雅的 `loading` 状态解决方案之一。
- `store` 内部方法可以使用 `this.stores.TodoStore` 访问其他的 `store` 示例，实现更复杂的数据交互。

### 安装

```shell
npm install iostore --save
// or
yarn add iostore
```

### 最简 `demo`

```js
// demo.js
import React, { useEffect } from 'react';
import { createStore, useStore } from 'iostore';

export default () => {
  const MyStore = createStore({
    namespace: 'MyStore', // 已经注册到全局 store
    firstName: 'li',
    lastName: 'lei',
    fullName: '',
    userInfo: {},
    getFullName() {
      this.fullName = `${this.firstName} ${this.lastName}`;
    },
    async getMyLoginInfo() {
      const res = await fetch('/api/userinfo');
      this.userInfo = res;
    },
  }).useStore();

  const { loading } = MyStore;
  const fetchUserInfo = () => {
    MyStore.getMyLoginInfo();
  };

  useEffect(() => {
    MyStore.getFullName();
  }, []);

  return (
    <div loading={loading}>
      <div>{MyStore.fullName}</div>
      <div>{MyStore.firstName}</div>
      <div>{MyStore.lastName}</div>
      <div>
        用户信息：
        {MyStore.userInfo.nickname || ''}
      </div>
      <button type="button" loading={MyStore.getMyLoginInfo.loading} onClick={fetchUserInfo}>
        获取用户信息
      </button>
    </div>
  );
};
// 另一个希望复用 MyStore 的组件
import { useStore } from 'iostore';
export default () => {
  const { MyStore } = useStore(); // 直接声明使用全局的 store
  return <div>{MyStore.fullName}</div>;
};
```

### 项目后续计划

- [ ] 支持 `TypeScript`
- [ ] 支持 `Vuejs`
- [ ] 完善更多的测试用例

此外，本人目前还在为腾讯云工作，后续将有可能先应用到腾讯云内部的一些业务，所以可以暂时放心，项目不会那么快就烂尾。
更多详情欢迎移步 `Github` 上围观，地址：https://github.com/yisbug/iostore
如果觉得还不错的话，欢迎试用哈，方便的话顺手点个 star，如有问题可以留言，也可以邮件 `yisbug@qq.com` 交流，多谢。
