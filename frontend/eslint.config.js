import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import vitest from '@vitest/eslint-plugin'
import milashConfig from '@milashensky/eslint-config'
import importPlugin from 'eslint-plugin-import'
import globals from 'globals'


export default defineConfig(
    {
        ignores: ['.react-router/**'],
    },
    eslint.configs.recommended,
    tseslint.configs.recommended,
    milashConfig,
    {
        files: ['vite.config.*'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
    {
        files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
        plugins: {
            import: importPlugin,
        },
        settings: {
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: './tsconfig.json',
                },
            },
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2021,
                React: 'readonly',
                NodeJS: 'readonly',
            },
        },
        rules: {
            'import/prefer-default-export': 'off',
            'import/extensions': [
                'error',
                'ignorePackages',
                {
                    'js': 'never',
                    'jsx': 'never',
                    'ts': 'never',
                    'tsx': 'never',
                },
            ],
            'react/react-in-jsx-scope': 'off',
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.json',
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['error'],
        },
    },
    {
        files: [
            'app/test/**',
            '**/__tests__/**',
            '**/__mocks__/**',
        ],
        plugins: {
            vitest,
        },
        rules: {
            ...vitest.configs.recommended.rules,
        },
        languageOptions: {
            globals: {
                ...vitest.environments.env.globals,
                window: true,
            },
        },
    },
)
