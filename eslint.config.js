import * as config from '@lvce-editor/eslint-config'
import * as actions from '@lvce-editor/eslint-plugin-github-actions'

export default [
  ...config.default,
  ...actions.default,
  {
    files: ['.github/workflows/*.yml', '.github/workflows/*.yaml'],
    rules: {
      'github-actions/action-versions': 'off',
      'github-actions/no-e2e-in-release': 'off',
    },
  },
  {
    files: ['**/*.json'],
    rules: {
      'package-json/no-empty-fields': 'off',
      'package-json/valid-author': 'off',
      'package-json/valid-description': 'off',
      'package-json/require-license': 'off',
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@cspell/spellchecker': 'off',
      'unicorn/no-array-sort': 'off',
      'unicorn/no-break-in-nested-loop': 'off',
      'unicorn/no-global-object-property-assignment': 'off',
      'unicorn/no-constant-zero-expression': 'off',
      'jest/expect-expect': 'off',
      'sonarjs/assertions-in-tests': 'off',
      'sonarjs/unused-import': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'sonarjs/no-dead-store': 'off',
    },
  },
  {
    ignores: ['**/package.json', '**/tsconfig.json', '**/lerna.json', '**/package-lock.json', '**/extension.json'],
  },
]
