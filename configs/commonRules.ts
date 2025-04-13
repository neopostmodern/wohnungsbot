export const styleRules = [
  {
    test: /\.s?(c|a)ss$/,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          modules: {
            namedExport: false
          },
          sourceMap: true,
          importLoaders: 1
        }
      },
      'sass-loader'
    ],
    exclude: /\.global\.s?(c|a)ss$/
  },
  {
    test: /\.global\.s?css$/,
    use: ['style-loader', 'css-loader', 'sass-loader']
  }
];

export const imageAndFontRules = [
  {
    test: /\.(jpe?g|png|gif|ico|eot|ttf|woff2?)(\?v=\d+\.\d+\.\d+)?$/i,
    type: 'asset/resource',
    generator: {
      publicPath: 'dist/'
    }
  },
  {
    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/i,
    type: 'asset/inline'
  }
];
