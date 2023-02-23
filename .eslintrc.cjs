module.exports = {
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  extends: ['plugin:vue/vue3-recommended', 'plugin:nuxt/recommended', 'prettier'],
  rules: {
    'vue/multi-word-component-names': 0,
  },
}
