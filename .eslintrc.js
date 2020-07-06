module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: ['prettier', 'plugin:import/errors', 'prettier/react'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', 'prettier'],
  rules: {
    'max-len': [
      'error',
      {
        code: 100,
        comments: 80,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
    'prettier/prettier': 'error',
  },
};
