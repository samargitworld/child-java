/*
👋 Hi! This file was autogenerated by tslint-to-eslint-config.
https://github.com/typescript-eslint/tslint-to-eslint-config

It represents the closest reasonable ESLint configuration to this
project's original TSLint configuration.

We recommend eventually switching this configuration to extend from
the recommended rulesets in typescript-eslint.
https://github.com/typescript-eslint/tslint-to-eslint-config/blob/master/docs/FAQs.md

Happy linting! 💖
*/
module.exports = {
    'env': {
        'browser': true,
        'es6': true,
        'node': true
    },
    'extends': [
        'plugin:@typescript-eslint/recommended'
    ],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'sourceType': 'module'
    },
    'plugins': [
        '@typescript-eslint'
    ],
    'root': true,
    'ignorePatterns': [
        '**/*.d.ts',
        '**/*.test.ts'
    ],
    'rules': {
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/adjacent-overload-signatures': 'error',
        '@typescript-eslint/array-type': [
            'error',
            {
                'default': 'array'
            }
        ],
        '@typescript-eslint/ban-types': [
            'error',
            {
                'types': {
                    'Object': {
                        'message': 'Avoid using the `Object` type. Did you mean `object`?'
                    },
                    'Function': {
                        'message': 'Avoid using the `Function` type. Prefer a specific function type, like `() => void`.'
                    },
                    'Boolean': {
                        'message': 'Avoid using the `Boolean` type. Did you mean `boolean`?'
                    },
                    'Number': {
                        'message': 'Avoid using the `Number` type. Did you mean `number`?'
                    },
                    'String': {
                        'message': 'Avoid using the `String` type. Did you mean `string`?'
                    },
                    'Symbol': {
                        'message': 'Avoid using the `Symbol` type. Did you mean `symbol`?'
                    }
                }
            }
        ],
        '@typescript-eslint/consistent-type-assertions': 'error',
        '@typescript-eslint/dot-notation': 'off',
        '@typescript-eslint/explicit-module-boundary-types': [
            'error',
            {
                'allowArgumentsExplicitlyTypedAsAny': true,
                'allowDirectConstAssertionInArrowFunctions': true,
                'allowHigherOrderFunctions': false,
                'allowTypedFunctionExpressions': false
            }
        ],
        '@typescript-eslint/indent': 'error',
        '@typescript-eslint/naming-convention': [
            'off',
            {
                'selector': 'variable',
                'format': [
                    'camelCase',
                    'UPPER_CASE'
                ],
                'leadingUnderscore': 'forbid',
                'trailingUnderscore': 'forbid'
            }
        ],
        '@typescript-eslint/no-empty-function': 'error',
        '@typescript-eslint/no-empty-interface': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-misused-new': 'error',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-parameter-properties': 'off',
        '@typescript-eslint/no-shadow': [
            'error',
            {
                'hoist': 'all'
            }
        ],
        '@typescript-eslint/no-unused-expressions': 'error',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-var-requires': 'error',
        '@typescript-eslint/prefer-for-of': 'error',
        '@typescript-eslint/prefer-function-type': 'error',
        '@typescript-eslint/prefer-namespace-keyword': 'error',
        '@typescript-eslint/quotes': [
            'error',
            'single',
            {
                'avoidEscape': true
            }
        ],
        '@typescript-eslint/triple-slash-reference': [
            'error',
            {
                'path': 'always',
                'types': 'prefer-import',
                'lib': 'always'
            }
        ],
        '@typescript-eslint/typedef': [
            'error',
            {
                'parameter': true,
                'arrowParameter': true,
                'propertyDeclaration': true,
                'variableDeclaration': true,
                'memberVariableDeclaration': true
            }
        ],
        '@typescript-eslint/unified-signatures': 'error',
        'complexity': 'off',
        'constructor-super': 'error',
        'dot-notation': 'off',
        'eqeqeq': [
            'error',
            'smart'
        ],
        'guard-for-in': 'error',
        'id-denylist': 'off',
        'id-match': 'off',
        'indent': 'off',
        'max-classes-per-file': [
            'error',
            1
        ],
        'max-len': [
            'off',
            {
                'code': 120
            }
        ],
        'new-parens': 'error',
        'no-bitwise': 'error',
        'no-caller': 'error',
        'no-cond-assign': 'error',
        'no-console': 'error',
        'no-debugger': 'error',
        'no-empty': 'error',
        'no-empty-function': 'off',
        'no-eval': 'error',
        'no-fallthrough': 'off',
        'no-invalid-this': 'off',
        'no-new-wrappers': 'error',
        'no-shadow': 'off',
        'no-throw-literal': 'error',
        'no-trailing-spaces': 'error',
        'no-undef-init': 'error',
        'no-underscore-dangle': 'off',
        'no-unsafe-finally': 'error',
        'no-unused-expressions': 'off',
        'no-unused-labels': 'error',
        'no-use-before-define': 'off',
        'no-var': 'error',
        'object-shorthand': 'error',
        'one-var': [
            'error',
            'never'
        ],
        'prefer-const': 'error',
        'quotes': 'off',
        'radix': 'error',
        'spaced-comment': [
            'error',
            'always',
            {
                'markers': [
                    '/'
                ]
            }
        ],
        'use-isnan': 'error',
        'valid-typeof': 'off'
    }
};
