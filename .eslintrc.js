
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'indent': ['error', 2], // Enforce 2-space indentation
    'linebreak-style': ['error', 'unix'], // Enforce Unix linebreaks
    'quotes': ['error', 'single'], // Enforce the consistent use of single quotes
    'semi': ['error', 'always'], // Require semicolons at the end of statements
    'no-unused-vars': ['warn'], // Warn about variables that are declared but not used
    'eqeqeq': ['error', 'always'], // Enforce the use of === and !== over == and !=
    'curly': ['error', 'all'], // Require following curly brace conventions
    'no-multi-spaces': 'error', // Disallow multiple spaces that are not for indentation
    'array-bracket-spacing': ['error', 'never'], // Disallow or enforce spaces inside of brackets
    'object-curly-spacing': ['error', 'always'], // Enforce consistent spacing inside braces of object literals
    'block-spacing': ['error', 'always'], // Enforce consistent spacing inside single-line blocks
    'comma-spacing': ['error', { 'before': false, 'after': true }], // Enforce spacing before and after commas
    'func-call-spacing': ['error', 'never'], // Require or disallow spacing between function identifiers and their invocations
    'key-spacing': ['error', { 'beforeColon': false, 'afterColon': true }], // Enforce consistent spacing between keys and values in object literal properties
    'no-trailing-spaces': 'error', // Disallow trailing whitespace at the end of lines
    'space-in-parens': ['error', 'never'], // Enforce consistent spacing inside parentheses
    'space-before-blocks': 'error', // Enforce consistent spacing before blocks
    'space-infix-ops': 'error', // Require spacing around infix operators
    'spaced-comment': ['error', 'always', { 'markers': ['/'] }], // Enforce consistent spacing after the // or /* in a comment
  }
};
