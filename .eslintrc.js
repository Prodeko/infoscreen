module.exports =  {
  parser:  '@typescript-eslint/parser',
  parserOptions:  {
    ecmaVersion:  2018,
    sourceType:  'module',
  },
  settings: {
    "react": {
      "pragma": "React",
      "version": "detect"
    },
  },
  plugins: ['react', '@typescript-eslint'],
  extends:  [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  rules: {
    "prettier/prettier": ["error"],
    "react/display-name": 0,
    "react/prop-types": 0,
    "no-undef": 0,
    "@typescript-eslint/explicit-member-accessibility": 0,
    "@typescript-eslint/explicit-function-return-type": [
      "warn",
      {
        "allowExpressions": true,
      }
    ]
  },
};