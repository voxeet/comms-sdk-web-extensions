const path = require('path');

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    externals: {
        '@voxeet/voxeet-web-sdk': {
            amd: 'VoxeetSDK',
            root: 'VoxeetSDK',
            commonjs: 'VoxeetSDK',
            commonjs2: 'VoxeetSDK',
        },
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    devtool: 'eval-source-map',
    output: {
        filename: 'voxeet-web-sdk-ext.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'VoxeetSDKExt',
        libraryTarget: 'umd',
        libraryExport: 'default',
    },
    mode: 'production',
};
