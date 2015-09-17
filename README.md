# codeRule
> The grunt gulp plugin for js/css/sass/less  in specific order.

总结一些项目中经常使用的基于grunt和gulp的集成管理配置，
以及一些常用的编码配置文件，git，npm相关等。
主要针对初学者，提供便捷的入门设置。

grunt gulp
======

Install
-------
```shell
npm install -g grunt-cli
npm install grunt --save-dev
npm install grunt-xx-xx --save-dev
npm install -g gulp-cli
npm install gulp --save-dev
npm install gulp-xx-xx --save-dev
```

Demo & Docs
-----------

## .jshintrc
* 定义js语法规范
* [grunt-contrib-jshint](grunt-contrib-jshint)
* 中文定义说明


##.csscomb.json
* 定义CSS属性排序规则
* [grunt-csscomb](https://github.com/csscomb/grunt-csscomb)
* 具体配置可参考详细链接详细说明
* 简单配置

```js
custom : {
        options : {
            config : '.csscomb.json'
        },
        files: {
            'xx/dest.css' : ['xx/style.css'],
        }
    }
grunt.loadNpmTasks('grunt-csscomb');
```

##.csslintrc
* 定义CSS语法检查规则
* [grunt-contrib-csslint](https://github.com/gruntjs/grunt-contrib-csslint)
* 具体配置可参考详细链接详细说明
* gulp简单配置

```js
options: {
		csslintrc: '.csslintrc'
	},
	strict: {
		options: {
			import: 2
		},
		src: ['public/*.css']
	},
	lax: {
		options: {
			import: false
		},
		src: ['public/*.css']
	}
```


##.scsslintrc
* 定义sass语法检查规则
* [grunt-contrib-csslint](https://github.com/gruntjs/grunt-contrib-csslint)
* 具体配置可参考详细链接详细说明
* 简单配置

```js
gulp.task("sass", function(done) {
  gulp.src("./app/styles/main.scss")
  .pipe($.sass()).on('error', handleError)
  .pipe($.autoprefixer({
    browsers: ['last 2 versions'],
    cascade: false
  }))
  .pipe(gulp.dest(".tmp/styles/"))
  .on("end", done);
});
```

* grunt 配置

```js
sass: {
        options: {
            sourceMap: true
        },
        dist: {
            files: {
                'main.css': 'main.scss'
            }
        }
    }
```

##.editorconfig
* 定义不同IDE和editor的编码风格
* 更多定义规范可自行Google，建议地址[EditorConfig](https://packagecontrol.io/packages/EditorConfig)


##.gitattributes
* 定义git配置
* 更多定义规范可自行Google，建议地址[git](http://git-scm.com/docs/gitattributes)
* [中文推荐文档](http://blog.csdn.net/igorzhang/article/details/17420949#t10)


##.gitignore
* 定义git忽略文件配置
* 具体规范可google


##.npmignore
* 定义npm发布包的忽略配置
* 描述了我们过滤掉那些文件不发布到npm上去，一般必须过滤掉的目录就是node_modules
* [中文推荐文档-推酷](http://www.tuicool.com/articles/BjAZ7bR)


##.travis.yml
* 简单描述就是关联github项目，部署环境，测试等。
* [travis](https://travis-ci.org)


##coffeelint.json
* coffeescript规范


#TODO

##autoprefixer

##babel

##mocha

##node-inspector

##nodemon

##react

##traceur

##uglify

##cssmin


##LICENSE
* 开源协议 一般为MIT


##README.md
* 项目说明文档，markdown语法

