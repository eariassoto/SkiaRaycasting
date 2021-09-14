const path = require( 'path' );
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    // generate source maps
    devtool: 'source-map',

    // bundling mode
    mode: 'development',

    // entry files
    entry: './src/program/main.ts',

    // output bundles (location)
    output: {
        path: path.resolve( __dirname, 'dist' ),
        filename: 'main.js',
    },

    // file resolutions
    resolve: {
        extensions: [ '.ts', '.js' ],
        fallback: {
            "fs": false,
            "path": false,
        },
    },

    // loaders
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader, // instead of style-loader
                    "css-loader"
                ]
            },
            {
                test: /\.tsx?/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.(asset)$/i,
                use: [
                  {
                    loader: 'file-loader',
                    options: {
                        name: '[contenthash].wasm'
                      }
                  },
                ],
              },
        ],
    },

    plugins: [
        new CopyPlugin({
          patterns: [
            { from: 'node_modules/canvaskit-wasm/bin/canvaskit.wasm' }
          ],
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "src", "index.html")
        }),
        new MiniCssExtractPlugin(),
    ],
};
