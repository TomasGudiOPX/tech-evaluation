import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.yarn/**',
      '**/coverage/**',
      '**/openspec/**',
      '**/docs/**',
      '**/tests/**',
      '**/vault/**',
      '**/*.md',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,mjs}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    ...reactHooks.configs.flat.recommended,
    rules: {
      ...(reactHooks.configs.flat.recommended.rules ?? {}),
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  eslintConfigPrettier,
);
