import js from '@eslint/js';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  // グローバル設定
  {
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        document: 'readonly',
        window: 'readonly',
        global: 'readonly',
        globalThis: 'readonly',
        // DOM APIs
        HTMLCanvasElement: 'readonly',
        HTMLButtonElement: 'readonly',
        CanvasRenderingContext2D: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        Event: 'readonly',
        // ブラウザAPI
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
  },

  // JavaScript基本ルール
  js.configs.recommended,

  // TypeScriptファイル用設定
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Prettierとの統合
      ...prettierConfig.rules,
      'prettier/prettier': 'error',

      // 基本的なJavaScriptルール
      'no-console': 'off', // ゲーム開発でデバッグ重要
      'no-debugger': 'error',
      'no-alert': 'warn',
      'no-duplicate-imports': 'error',
      'prefer-const': 'error',
      'no-var': 'error',

      // TypeScript基本ルール
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
    },
  },

  // テストファイル用設定
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
    },
  },

  // 設定ファイル用
  {
    files: ['*.config.js', '*.config.ts', 'vite.config.*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // 除外ファイル
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.min.js',
      'coverage/**',
      '.vite/**',
      'src/main-broken.ts',
      'src/minimal-main.ts',
      'src/simple-test.ts',
    ],
  },
];
