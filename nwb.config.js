module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'AccessibleReactTable',
      externals: {
        react: 'React',
      },
    },
  },
  babel: {
    presets: ['env', 'react'],
    plugins: ['transform-class-properties', 'transform-object-rest-spread'],
  },
  webpack: {
    // rules: {
    //   babel: {
    //     test: /\.jsx?$/,
    //     loader: 'babel-loader',
    //     exclude: /node_modules/,
    //     presets: ['env', 'react'],
    //     plugins: ['transform-class-properties', 'transform-object-rest-spread'],
    //   },
    // },
    extra: {
      // entry: {
      //   main: './src/index.js',
      // },
      // resolve: {
      //   extensions: ['.js', '.jsx', '.json'],
      // },
      module: {
        rules: [
          {
            test: /\.js$/,
            enforce: 'pre',
            loader: 'eslint-loader',
            exclude: /node_modules/,
          },
        ],
      },
    },
  },
};
