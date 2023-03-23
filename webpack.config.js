var path = require('path');

module.exports = {
    mode: 'production',
    entry:  './src/ActivityDetector.js',
    output: {
        path: path.resolve('lib'),
        filename: 'ActivityDetector.js',
        libraryTarget: 'commonjs2'
    },
    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /(node_modules)/
            }
        ]
    },
    externals: {
        // don't export React and other dependencies, use parent-project modules instead
        'react': 'commonjs react',
    },
}