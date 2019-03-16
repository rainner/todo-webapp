/**
 * Webpack config
 */
const path = require( 'path' );
const webpack = require( 'webpack' );

module.exports = {

    entry: './src/main.js',

    output: {
        path: path.resolve( __dirname, './public/js' ),
        publicPath: '/public/js/',
        filename: 'bundle.js'
    },

    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.common.js',
        }
    },

    devServer: {
        host: 'localhost',
        port: 3000,
        clientLogLevel: 'info',
        historyApiFallback: true,
        noInfo: true,
        inline: true,
        compress: false,
    },

    performance: {
        hints: false,
    },

    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        'scss': 'vue-style-loader!css-loader!postcss-loader!sass-loader',
                        'sass': 'vue-style-loader!css-loader!postcss-loader!sass-loader?indentedSyntax',
                    }
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
        ]
    },
};

/**
 * Production build
 */
if ( process.env.NODE_ENV === 'production' ) {

    module.exports.plugins = ( module.exports.plugins || [] ).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"',
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false,
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        }),
    ]);
}
