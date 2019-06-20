const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');

module.exports = {
    entry: [
        'babel-polyfill',
        './src/app.js'
    ],
    output: {
        path: path.resolve( __dirname, 'dist/assets' ),
        filename: 'assets/js/app.js',
        // 所有资源的基础路径，总是 "/" 结尾
        publicPath: '/',
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/index.html'
        }),
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, 'dist')],
            dry: true,
            verbose: true,
        })
    ],
    resolve: {
        extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx'],
        alias: {
            '@': path.join(__dirname, 'src'),
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: [
                    {
                        loader: 'babel-loader',
                    }
                ],
                exclude: [
                    path.resolve( __dirname, 'node_modules' ),
                ]
            },
            // 处理css文件，模块化引入(import [objName] from [url])
            // localIdentName ： '[path]_[name]_[local]_[hash:base64:6]'
            {
                test: /\.css$/,
                use: [ 
                        'style-loader', 
                        {
                            loader: 'css-loader',
                            options: {
                                module: true,
                                localIdentName: '[path]_[name]_[local]_[hash:base64:6]'
                            }
                        } 
                    ],
                exclude: [
                    path.resolve( __dirname, 'node_modules' ),
                    path.resolve( __dirname, 'src/common' ),
                ]
            },
            {
                test: /\.css$/,
                use: [ 
                        'style-loader', 
                        'css-loader',
                    ],
                include: [
                    path.resolve( __dirname, 'node_modules' ),
                    path.resolve( __dirname, 'src/common' ),
                ]
            },
            // 处理scss, sass文件
            {
                test: /\.s(c|a)ss$/,
                use: [ 
                        'style-loader', 
                        {
                            loader: 'css-loader',
                            options: {
                                module: true,
                                localIdentName: '[name]_[local]_[hash:base64:6]'
                            }
                        },
                        'sass-loader',
                    ],
                exclude: [
                    path.resolve( __dirname, 'node_modules' ),
                    path.resolve( __dirname, 'src/common' ),
                ]
            },
            {
                test: /\.s(c|a)ss$/,
                use: [ 
                        'style-loader', 
                        'css-loader',
                        'sass-loader',
                    ],
                include: [
                    path.resolve( __dirname, 'node_modules' ),
                    path.resolve( __dirname, 'src/common' ),
                ]
            },
            // 处理less文件
            {
                test: /\.less$/,
                use: [ 
                        'style-loader', 
                        {
                            loader: 'css-loader',
                            options: {
                                module: true,
                                localIdentName: '[local]'
                            }
                        },
                        'less-loader',
                    ],
                exclude: [
                    path.resolve( __dirname, 'node_modules' ),
                    path.resolve( __dirname, 'src/common' ),
                ]
            },
            {
                test: /\.less$/,
                use: [ 
                        'style-loader', 
                        'css-loader',
                        'less-loader',
                    ],
                include: [
                    path.resolve( __dirname, 'node_modules' ),
                    path.resolve( __dirname, 'src/common' ),
                ]
            },
            // file-loader:
            //     1. 把你的资源移动到输出目录
            //     2. 放回最终引入资源的url
            //     options.name: 默认为'[hash].[ext]'
            //         '[path]_[name]_[hash].[ext]'
            {
                test: /\.(jpg|png|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 200000,
                            name: 'assets/img/[name]_[hash:8].[ext]'
                        }
                    }
                ]
            },
            {
                test: /\.(ttf|eot|svg|woff|woff2)$/,
                use: [ 
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'assets/fonts/[name]_[hash:8].[ext]'
                        }
                    } 
                ]
            },
        ]
    },
    devServer: {
        open: true,
        port: 3001,
        contentBase: './src/common/',
        // 服务器所打包资源的输出路径。总是以 "/" 开头，总是以 "/" 结尾
        // 所有资源打包查询的起点
        publicPath: '/',
        historyApiFallback: true
    }
};