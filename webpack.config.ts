/**
 * webpack configuration
 */

import * as webpack from 'webpack';
import * as chalk from 'chalk';
const { VueLoaderPlugin } = require('vue-loader');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const isProduction = process.env.NODE_ENV == 'production';

const locales = require('./locales');
const meta = require('./package.json');

const postcss = {
	loader: 'postcss-loader',
	options: {
		plugins: [
			require('cssnano')({
				preset: 'default'
			})
		]
	},
};

module.exports = {
	entry: {
		app: './src/client/init.ts',
		sw: './src/client/sw.js'
	},
	module: {
		rules: [{
			test: /\.vue$/,
			exclude: /node_modules/,
			use: [{
				loader: 'vue-loader',
				options: {
					cssSourceMap: false,
					compilerOptions: {
						preserveWhitespace: false
					}
				}
			}, {
				loader: 'vue-svg-inline-loader'
			}]
		}, {
			test: /\.scss?$/,
			exclude: /node_modules/,
			oneOf: [{
				resourceQuery: /module/,
				use: [{
					loader: 'vue-style-loader'
				}, {
					loader: 'css-loader',
					options: {
						modules: true
					}
				}, postcss, {
					loader: 'sass-loader'
				}]
			}, {
				use: [{
					loader: 'vue-style-loader'
				}, {
					loader: 'css-loader'
				}, postcss, {
					loader: 'sass-loader'
				}]
			}]
		}, {
			test: /\.css$/,
			use: [{
				loader: 'vue-style-loader'
			}, {
				loader: 'css-loader'
			}, postcss]
		}, {
			test: /\.(eot|woff|woff2|svg|ttf)([?]?.*)$/,
			loader: 'url-loader'
		}, {
			test: /\.ts$/,
			exclude: /node_modules/,
			use: [{
				loader: 'ts-loader',
				options: {
					happyPackMode: true,
					transpileOnly: true,
					configFile: __dirname + '/src/client/tsconfig.json',
					appendTsSuffixTo: [/\.vue$/]
				}
			}]
		}]
	},
	plugins: [
		new ProgressBarPlugin({
			format: chalk`  {cyan.bold Yes we can} {bold [}:bar{bold ]} {green.bold :percent} {gray :elapseds}`,
			clear: false
		}),
		new webpack.DefinePlugin({
			_VERSION_: JSON.stringify(meta.version),
			_LANGS_: JSON.stringify(Object.entries(locales).map(([k, v]: [string, any]) => [k, v && v.meta && v.meta.lang])),
			_ENV_: JSON.stringify(process.env.NODE_ENV)
		}),
		new VueLoaderPlugin(),
	],
	output: {
		path: __dirname + '/built/client/assets',
		filename: '[name].js',
		chunkFilename: '[hash:5].[id].js',
		publicPath: `/assets/`
	},
	resolve: {
		extensions: [
			'.js', '.ts', '.json'
		],
		alias: {
			'const.styl': __dirname + '/src/client/const.styl'
		}
	},
	resolveLoader: {
		modules: ['node_modules']
	},
	externals: {
		moment: 'moment'
	},
	optimization: {
		minimizer: [new TerserPlugin()]
	},
	cache: true,
	devtool: false, //'source-map',
	mode: isProduction ? 'production' : 'development'
};
