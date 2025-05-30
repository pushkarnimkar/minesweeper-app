const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';
    const isJekyllTarget = env && env.target === 'jekyll';

    // Determine output path based on target
    const getOutputPath = () => {
        if (isJekyllTarget) {
            // Adjust this path to your Jekyll repo location
            // Assumes Jekyll repo is a sibling directory
            return path.resolve(__dirname, '../my-jekyll-site/assets');
        }
        return path.resolve(__dirname, 'dist');
    };

    const outputPath = getOutputPath();

    console.log(`Building for: ${isJekyllTarget ? 'Jekyll' : 'Local'}`);
    console.log(`Output path: ${outputPath}`);

    return {
        entry: './src/index.ts',

        output: {
            path: path.join(outputPath, 'js'),
            filename: 'minesweeper.js',
            library: 'Minesweeper',
            libraryTarget: 'umd',
            globalObject: 'this',
            clean: true
        },

        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader'
                    ]
                }
            ]
        },

        resolve: {
            extensions: ['.tsx', '.ts', '.js', '.css']
        },

        externals: {
            'react': 'React',
            'react-dom': 'ReactDOM'
        },

        plugins: [
            new MiniCssExtractPlugin({
                filename: '../css/minesweeper.css' // Goes to assets/css/
            })
        ],

        devtool: isProduction ? false : 'source-map',

        stats: {
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
        }
    };
};
