export const isFunction = fn => typeof fn === 'function';
export const isUndefined = prop => typeof prop === 'undefined';
export const isObject = o => Object.prototype.toString.call(o) === '[object Object]';
export const isArray = o => Array.isArray(o);
export const isPromise = fn => {
  if (fn instanceof Promise) return true;
  return isObject(fn) && isFunction(fn.then);
};
export const addProxy = (o, handler) => {
  if (isArray(o)) {
    o.forEach((item, index) => {
      if (isObject(item)) {
        o[index] = addProxy(item, handler);
      }
    });
  } else if (isObject(o)) {
    Object.keys(o).forEach(key => {
      if (isObject(o[key])) {
        o[key] = addProxy(o[key], handler);
      }
    });
  } else {
    return o;
  }
  // eslint-disable-next-line
  if (o && o.__isProxy__) return o;
  return new Proxy(o, handler);
};
