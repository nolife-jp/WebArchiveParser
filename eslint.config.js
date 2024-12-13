// eslint.config.js
import { defineConfig } from 'eslint-define-config';

export default defineConfig({
  env: {
    node: true,
    es2021: true,
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'error',
    'no-console': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        // 必要に応じて追加のルールをここに記述
      },
    },
  ],
});
