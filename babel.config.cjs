const config = {
  presets: [['@babel/preset-typescript', { jsxPragma: 'h' }]],
  plugins: [
    ['const-enum', { transform: 'constObject' }],
    [
      '@babel/plugin-transform-react-jsx',
      { pragma: 'h', pragmaFrag: 'Fragment' },
    ],
  ],
}

module.exports = config
