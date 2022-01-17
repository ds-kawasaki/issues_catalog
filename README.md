# issues_catalog
redmine plugin  
DS変更版redmine_tagsプラグイン（ https://github.com/ds-kawasaki/redmine_tags ）とセットで動作する  

## 開発環境
```
$ ruby --version
ruby 2.7.5p203 (2021-11-24 revision f69aeb8314) [x86_64-linux]
$ rails --version
Rails 5.2.6
$ node --version
v14.18.2
$ npm --version
6.14.15
```

## 開発について
javascriptは front_src/javascripts 内のファイルをwebpackでバンドルしています  

開発はVSCodeが前提です  
VSCodeのデバッグ実行で「Rails server」の起動・再起動時に npm run build:dev するタスクを組み込んでいます  
webpackのwatchだとrails側でエラーになるので、
ソースコードを変更したらデバッグの再起動ボタンで反映させます  


## 開発時初回
```
$ cd redmine/plugins/issues_catalog
$ npm install
```

## リリース時

init.rbのバージョン番号のインクリメントと npm run build してからコミットすること
