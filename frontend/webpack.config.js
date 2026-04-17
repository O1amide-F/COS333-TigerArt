//-----------------------------------------------------------------------
// webpack.config.js
// TigerArt
//-----------------------------------------------------------------------

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let config = {
    entry: {
        index: './src/main.tsx',
    },

    output: {
        // Store the output bundle in backend/static/
        path: path.resolve(__dirname, '..', 'backend', 'static'),

        // Name the output file
        filename: '[name].bundle.js',

    },

    plugins: [
        new HtmlWebpackPlugin({
            // Use our index.html as the template
            template: './index.html',
            // Output filename in the static folder
            filename: 'index.html',
            // Don't auto-inject the bundle script — we handle it in index.html
            inject: false,
        }),
    ],

    resolve: {
        // Allow imports without writing the extension
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },

    module: {
        rules: [
            {
                // Use babel-loader for all JS/TS/JSX/TSX files
                test: /\.(tsx?|jsx?)$/,
                loader: 'babel-loader',
                options: {
                    presets: [
                        '@babel/preset-env',
                        ['@babel/preset-react', { runtime: 'automatic' }],
                        '@babel/preset-typescript',
                    ],
                },
                exclude: /node_modules/,
            },
            {
                // Use css-loader + style-loader for CSS files
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
};

module.exports = (env, argv) => {
    if (argv.mode === 'development') {
        config.devtool = 'source-map';
    }
    return config;
};
