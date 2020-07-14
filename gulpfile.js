const gulp = require('gulp');
const browserSync = require('browser-sync');	//ローカルでWebサーバ起動
const del = require('del');	//ファイル削除
const uglify = require('gulp-uglify');	//minify
// const saveLicense = require('uglify-save-license');	//minify時にライセンス表記を消さないようにする
const cachebust = require('gulp-cache-bust'); // キャッシュバスティング

// HTML
// const htmlhint = require('gulp-htmlhint');	//静的コードチェッカ

// CSS
const sass = require('gulp-sass');	//gulpでsassのトランスパイルができるようにする
const postcss = require('gulp-postcss');	//ポストプロセッサ（autoprefixer等を使うためのもの）
const autoprefixer = require('autoprefixer');	//ベンダープレフィックス付与
const cssnano = require('cssnano');
const mqpacker = require('css-mqpacker');
const cssdeclsort = require('css-declaration-sorter');
const packageImporter = require('node-sass-package-importer');	//node_modulesからsassをインポート
const sasslint = require('gulp-sass-lint'); // scssの文法チェック。
const sassGlob = require('gulp-sass-glob'); // Sassの@importにおけるglobを有効にする

// JS
const plumber = require('gulp-plumber');
const eslint = require('gulp-eslint'); // jsの文法チェック。設定ファイルは.eslintrc

const paths = {
	html: ['_src/**/*.html'],
	scss: ['_src/scss/**/*.scss'],
	js: ['_src/js/**/*.js'],
	assets: ['_src/img/*'],
	dist: ['dist']
};

/***************************************
 * html build
 ****************************************/
const buildHtml = () => {
	return gulp.src(paths.html, { base: '_src' })
		.pipe(plumber())
		.pipe(cachebust({
			type: 'timestamp'
		}))
		.pipe(plumber.stop())
		.pipe(gulp.dest(paths.dist + '/'));
};

/***************************************
 * sass build
 ****************************************/
const buildSass = () => {
	return gulp.src(paths.scss, { sourcemaps: true})
		.pipe(plumber())
		.pipe(sasslint({
			configFile: './sass-lint.yml' // lint rule指定ファイル
		}))
		.pipe(sasslint.format())
		.pipe(sasslint.failOnError())
		.pipe(sassGlob())
		.pipe(sass({
			outputStyle: 'expanded' // 出力後の見た目がキモくなるので普通のcssみたいにする
		}))
		.pipe(postcss([
			autoprefixer({ // ベンダープレフィックスを付ける
				grid: 'autoplace'
			}),
			cssnano({
				autoprefixer: false
			}),
			mqpacker(), // メディアクエリを一つにまとめる
			cssdeclsort({	//プロパティのソート
				order: 'smacss'
			})
		]))
		.pipe(plumber.stop())
		.pipe(gulp.dest(paths.dist + '/css', { sourcemaps: './maps'}));
};

/***************************************
 * js build
 ****************************************/
const buildJs = () => {
	return gulp.src(paths.js, { sourcemaps: true})
		.pipe(plumber({
			errorHandler: (error) => {
				let taskName = 'eslint';
				let title = '[task]' + taskName + ' ' + error.plugin;
				let errorMsg = 'error: ' + error.message;
				console.error(title + '\n' + errorMsg); // ターミナルにエラーを出力
				notifier.notify({ // エラーデスクトップに通知
					title: title,
					message: errorMsg,
					time: 3000
				});
			}
		}))
		.pipe(eslint({ useEslintrc: true })) // lint rule指定ファイルとして.eslintrcを参照
		.pipe(eslint.format())
		.pipe(eslint.failOnError())
		.pipe(uglify())
		.pipe(plumber.stop())
		.pipe(gulp.dest(paths.dist + '/js', { sourcemaps: './maps'}));
};

/***************************************
 * other
 ****************************************/
// dest内全ファイルクリア
const clean = (cb) => {
	return del(paths.dist + '/**/*.*', cb);
};

// assetsフォルダを階層ごとdestにコピー
const copy = () => {
	return gulp.src(paths.assets, { base: '_src/img' })
		.pipe(gulp.dest(paths.dist + '/img'));
};

// ローカルサーバ起動
const server = () => {
	return browserSync.init({
		server: {
			baseDir: paths.dist,
			index: 'index.html',
			logLevel: 'silent',
			notify: false,
			reloadDelay: 10000,
			reloadDebounce: 10000,
			directory: true
		},
		codeSync: true,
		startPath: '/',
		open: 'external'
	});
};

// 監視タスク
const watchFiles = () => {
	gulp.watch(paths.html).on('change', gulp.task('buildHtml'));
	gulp.watch(paths.js, gulp.task('buildJs'));
	gulp.watch(paths.scss, gulp.task('buildSass'));
	gulp.watch(paths.assets, gulp.task('copy'));
};

// タスク宣言
gulp.task('buildHtml', buildHtml);
gulp.task('buildSass', buildSass);
gulp.task('buildJs', buildJs);
gulp.task('copy', copy);
gulp.task('clean', clean);
gulp.task('server', server);

/***************************************
 * exe 実行
 ****************************************/
gulp.task('default', gulp.series(
	clean,
	copy,
	buildSass,
	buildJs,
	buildHtml,
	server,
	watchFiles
));
