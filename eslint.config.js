/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ['js/destination-detail.bundle.js'] },
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        document: 'readonly',
        fetch: 'readonly',
        IntersectionObserver: 'readonly',
        URLSearchParams: 'readonly',
        window: 'readonly',
        setTimeout: 'readonly',
        requestAnimationFrame: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
];
