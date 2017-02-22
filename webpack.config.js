
var path = require( "path" );
var webpack = require( "webpack" );

module.exports = {

    entry: "./src/main.js",

    output: {
        path: path.resolve( __dirname, "./public/js" ),
        publicPath: "/public/js/",
        filename: "bundle.js"
    },

    resolve: {
        alias: {
            "vue$": "vue/dist/vue.common.js",
        }
    },

    devServer: {
        host: "192.168.0.102",
        port: 8888,
        clientLogLevel: "info",
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
                loader: "vue-loader",
                options: {
                    loaders: {
                        "scss": "vue-style-loader!css-loader!postcss-loader!sass-loader",
                        "sass": "vue-style-loader!css-loader!postcss-loader!sass-loader?indentedSyntax",
                    }
                }
            },
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/,
            },
        ]
    },

    devtool: "#eval-source-map",
};

/**
 * Production build
 */
if( process.env.NODE_ENV === "production" )
{
    module.exports.devtool = "#source-map";

    module.exports.plugins = ( module.exports.plugins || [] ).concat([
        new webpack.DefinePlugin({
            "process.env": {
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
