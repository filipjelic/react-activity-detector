import { resolve } from 'path';

export const mode = 'production';
export const entry = './src/ActivityDetector.jsx';
export const output = {
    path: resolve('lib'),
    filename: 'ActivityDetector.js',
    libraryTarget: 'commonjs2'
};
export const module = {
    rules: [
        {
            test: /\.jsx?$/,
            exclude: /(node_modules)/,
            use: 'babel-loader'
        }
    ]
};