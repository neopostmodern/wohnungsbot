import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export const styleRules = [
  // Extract all .global.css to style.css as is
  {
    test: /\.global\.css$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          publicPath: './'
        }
      },
      {
        loader: 'css-loader',
        options: {
          sourceMap: true
        }
      }
    ]
  },
  // Pipe other styles through css modules and append to style.css
  {
    test: /^((?!\.global).)*\.css$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader
      },
      {
        loader: 'css-loader',
        options: {
          modules: {
            localIdentName: '[name]__[local]__[hash:base64:5]'
          },
          sourceMap: true
        }
      }
    ]
  },
  // Add SASS support  - compile all .global.scss files and pipe it to style.css
  {
    test: /\.global\.(scss|sass)$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader
      },
      {
        loader: 'css-loader',
        options: {
          sourceMap: true,
          importLoaders: 1
        }
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true
        }
      }
    ]
  },
  // Add SASS support  - compile all other .scss files and pipe it to style.css
  {
    test: /^((?!\.global).)*\.(scss|sass)$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader
      },
      {
        loader: 'css-loader',
        options: {
          modules: {
            localIdentName: '[name]__[local]__[hash:base64:5]'
          },
          importLoaders: 1,
          sourceMap: true
        }
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true
        }
      }
    ]
  }
];

export const imageAndFontRules = [
  {
    test: /\.(jpe?g|png|gif|ico|eot|ttf|woff2?)(\?v=\d+\.\d+\.\d+)?$/i,
    type: 'asset/resource'
  },
  {
    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/i,
    type: 'asset/inline'
  }
];
