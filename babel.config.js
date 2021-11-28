module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        debug: false,
        targets: {
          esmodules: true,
        },
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
};
