module.exports = {
  presets: [['@babel/preset-typescript', { jsxPragma: 'h' }]],
  plugins: [
    ['@babel/plugin-transform-react-jsx', { pragma: 'h' }],
    '@babel/plugin-syntax-dynamic-import',
    'babel-plugin-un-cjs',
  ],
}
