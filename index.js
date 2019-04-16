import { useState } from 'react';

class Model {
  constructor(config) {
    const { state = {}, ...reducers } = config;

    this.state = state;
    this.isChanged = false;

    this.reducers = reducers;
    this.queue = [];

    this.actions = {};

    Object.keys(reducers).forEach(type => {
      const action = (...args) => {
        this.dispatch({ type, payload: args });
        if (action.loading) {
          return action.promise.then(payload => {
            this.dispatch({ type, payload, loading: false });
          });
        }
      };
      action.loading = false;
      this.actions[type] = action;
    });

    this.useModel = () => {
      const [, setState] = useState();
      this.queue.push(setState);
      return [this.state, this.actions];
    };

    this.isLoading = () => {
      const types = Object.keys(this.actions);
      for (let i = 0; i < types.length; i += 1) {
        if (this.actions[types[i]].loading) return true;
      }
      return false;
    };

    this.getState = () => this.state;
  }

  dispatch(action) {
    const newState = { ...this.state, ...this.getNextState(action) };
    if (!this.shouldUpdate(newState)) return;
    this.state = newState;
    const queue = [].concat(this.queue);
    this.queue.length = 0;
    queue.forEach(setState => setState(this.state));
  }

  shouldUpdate(newState) {
    if (this.isChanged) {
      this.isChanged = false;
      return true;
    }

    if (this.state === newState) return false;
    const keys = Object.keys(newState);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (this.state[key] !== newState[key]) return true;
    }
    return false;
  }

  getNextState(action) {
    const { type, payload, loading } = action;
    const reducer = this.reducers[type];

    // 没有对应的actionType
    if (!reducer) return this.state;
    // 异步结束
    if (loading === false && this.actions[type].loading) {
      this.actions[type].loading = false;
      this.isChanged = true;
      return payload;
    }
    // 处理 action
    const newState = reducer.apply(this, payload);
    const isPromise = newState instanceof Promise;
    // 同步的 action
    if (!isPromise) return newState;
    // 异步的 action
    this.actions[type].loading = true;
    this.actions[type].promise = newState;
    this.isChanged = true;

    return this.state;
  }
}

const createModel = config => new Model(config);

export { Model as default, createModel };
