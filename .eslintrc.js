module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb', 'prettier', 'plugin:prettier/recommended'],
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  rules: {
    'no-param-reassign': 0,
    'no-plusplus': 0,
    'react/jsx-filename-extension': [1, { extensions: ['.js'] }],
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-noninteractive-element-interactions': 0,
  },
};
