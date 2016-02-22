module.exports = function(grunt) {     // 第一部分是"wrapper" 函数，它包含了整个Grunt配置信息。 

  grunt.initConfig({     // 初始化config对象
    pkg: grunt.file.readJSON('package.json'),     // 从package.json 文件读入项目配置信息，并存入pkg 属性内
    concat: {     // concat任务配置对象
      options: {
        separator: ';'     // 定义一个用于插入合并输出文件直接的字符
      },
      dist: {     
        src: ['js/AssistLine.js','js/Candle.js','js/CandleDate.js',
        'js/CandlePainter.js','js/CandleQueue.js','js/CrossLine.js',"js/FibonacciLine.js",
        "js/KAxis.js","js/PriceLine.js","js/Quota.js"],     // 将要被合并的文件 
        dest: 'dist/<%= pkg.name %>.js'     // 合并的JS文件存放的位置及文件名，package.json中定义的name
      }
    },
    uglify: {     // 配置uglify插件，压缩js文件
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'      // 注释
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']      // 会自动压缩concat任务生成的文件
        }
      }
    },
    
    jshint: {     // 这是一个js代码验证工具
      files: ['js/AssistLine.js','js/Candle.js','js/CandleDate.js',
        'js/CandlePainter.js','js/CandleQueue.js','js/CrossLine.js',"js/FibonacciLine.js",
        "js/KAxis.js","js/PriceLine.js","js/Quota.js"],     // 定义要检查的文件
      options: {     // 配置JSHint     http://www.jshint.com/docs/
        //这里是覆盖JSHint默认配置的选项
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');     //加载插件
  grunt.loadNpmTasks('grunt-contrib-jshint');
  //grunt.loadNpmTasks('grunt-contrib-qunit');
  //grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('test', ['jshint']);     //设置test任务

  grunt.registerTask('default', ['jshint','concat', 'uglify']);     //加载default任务 

};