// eslint.config.js
import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'
import prettier from 'eslint-config-prettier'

export default [
    js.configs.recommended,

    {
        files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tsParser,
                ecmaVersion: 'latest',
                sourceType: 'module'
            }
        },
        plugins: {
            vue,
            '@typescript-eslint': tseslint
        },
        rules: {
            /* ---------------- Vue ---------------- */
            'vue/multi-word-component-names': 'off',
            'vue/no-v-html': 'off',
            'vue/require-default-prop': 'off',

            /* ---------------- TS ---------------- */
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_' }
            ],
            '@typescript-eslint/no-explicit-any': 'off',

            /* ---------------- Style ---------------- */
            'no-console': import.meta.env?.PROD ? 'warn' : 'off',
            'no-debugger': import.meta.env?.PROD ? 'warn' : 'off'
        }
    },

    prettier
]
