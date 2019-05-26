const queue = {};
export const broadcast = (name, state) => {
  if (!queue[name]) return;
  queue[name].forEach(fn => fn(state));
};
export const subScribe = (name, cb) => {
  if (!queue[name]) queue[name] = [];
  queue[name].push(cb);
};
export const unSubScribe = (name, cb) => {
  if (!queue[name]) return;
  const index = queue[name].indexOf(cb);
  if (index !== -1) queue[name].splice(index, 1);
};
