var libName = require('./package.json').name;
var webpack = require('webpack');

module.exports = {
    entry: {
        [libName]: './src/angular-cron-translate.ts',
        [libName + '.min']: './src/angular-cron-translate.ts'
    },
    output: {
        path: __dirname + '/dist',
        filename: '[name].js',
        library: libName,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    resolve: {
        extensions: ['', '.js', '.ts']
    },
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: "awesome-typescript-loader?tsconfig=tsconfig.json&declaration=true&sourceMap=false"
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true,
            sideEffects: false
        })
    ],
    externals: {
        'angular': 'angular'
    }
};