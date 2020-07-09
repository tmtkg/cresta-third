const gulp = require('gulp');
const browserSync = require('browser-sync');	//ローカルでWebサーバ起動
const del = require('del');	//ファイル削除
const uglify = require('gulp-uglify');	//minify
// const saveLicense = require('uglify-save-license');	//minify時にライセンス表記を消さないようにする

// HTML
// const htmlhint = require('gulp-htmlhint');	//静的コードチェッカ

// CSS
const sass = require('gulp-sass');	//gulpでsassのトランスパイルができるようにする
const postcss = require('gulp-postcss');	//ポストプロセッサ（autoprefixer等を使うためのもの）
const autoprefixer = require('autoprefixer');	//ベンダープレフィックス付与
const packageImporter = require('node-sass-package-importer');	//node_modulesからsassをインポート
const sasslint = require('gulp-sass-lint'); // scssの文法チェック。

