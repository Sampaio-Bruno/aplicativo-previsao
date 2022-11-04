module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        appId: 'br.gov.sipam.divmet.pevisao',
        productName: 'Previsao',
        copyright: 'Copyright © 2020 divmet@sipam.gov.br',
        win: {
          icon: 'public/icon.png',
          target: [
            {
              target: 'nsis',
              arch: ['ia32', 'x64'], // windows 32 & 64
            },
          ],
        },
      },
    },
  },
  configureWebpack: {
    devtool: 'source-map',
  },
};
