const config = {
  presets: [['@babel/preset-typescript', { jsxPragma: 'h' }]],
  plugins: [
    [
      '@babel/plugin-transform-react-jsx',
      { pragma: 'h', pragmaFrag: 'Fragment' },
    ],
  ],
}

module.exports = config
