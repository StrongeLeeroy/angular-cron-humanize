module.exports = {
    entry: "./src/cron-humanize.ts",
    output: {
        filename: "./dist/index.js"
    },
    devtool: "source-map",
    resolve: {
        extensions: ['', '.ts', '.js']
    },
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'ts-loader'},
            { test: /\.js$/, loader: 'source-map-loader' }
        ]
    },
    externals: {
        'angular': 'angular'
    }
};