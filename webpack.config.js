module.exports = {
    entry: "./src/angular-cron-humanize.js",
    output: {
        filename: "./dist/index.js"
    },
    devtool: "source-map",
    resolve: {
        extensions: ['', '.ts', '.js']
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: 'source-map-loader' }
        ]
    },
    externals: {
        'angular': 'angular'
    }
};