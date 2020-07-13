const path = require('path');
const webpack = require('webpack');

module.exports = (env, argv) => {
  let production = argv.mode === 'production';

  return {
    entry: {
      'js/shortcode': path.resolve(__dirname, 'app/shortcode.js'),
    },

    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'assets'),
    },

    devtool: production ? '' : 'source-map',

    plugins: [
      new webpack.NormalModuleReplacementPlugin(
        /node_modules\/antd\/lib\/style\/index\.less/,
        path.resolve(__dirname, './app/components/styles/hockeystick-widget.less')
      ),
    ],

    resolve: {
      extensions: ['.js', '.jsx', '.json'],
    },

    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: [
            {
              loader: 'file-loader',
            },
          ],
        },
        {
          test: /\.less$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'less-loader',
              options: {
                javascriptEnabled: true,
                modifyVars: {
                  'font-family': "'Lato', sans-serif",
                },
              },
            },
          ],
        },
      ],
    },
  };
};
