module.exports = {
  extends: 'airbnb-base',
  parser: 'babel-eslint',
  plugins: [
    'import',
    'jest',
    'react-hooks',
    'react',
  ],
  env: {
    browser: true,
    node: true,
    jest: true,
    es6: true
  },
  rules: {
    "react/jsx-uses-vars": [2],
  },
};
