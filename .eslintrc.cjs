module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: 'eslint:recommended',
  plugins: ['import'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'brace-style': ['error', 'stroustrup'],
    'comma-dangle': ['error', 'always-multiline'],
    'quotes': ['error', 'single'],
    'quote-props': ['error', 'consistent-as-needed'],
    'semi': ['error', 'always'],
    'no-unused-vars': ['off'],
    'no-var': ['off'],
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        'alphabetize': { order: 'asc', caseInsensitive: true },
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'object', 'type'],
      },
    ],
  },
};
