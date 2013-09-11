module.exports = function(grunt) {
  grunt.initConfig({
    info: grunt.file.readJSON('bower.json'),
    meta: {
      banner: '/*!\n'+
              ' * <%= info.name %> - <%= info.description %>\n'+
              ' * v<%= info.version %>\n'+
              ' * <%= info.homepage %>\n'+
              ' * copyright <%= info.copyright %> <%= grunt.template.today("yyyy") %>\n'+
              ' * <%= info.license %> License\n'+
              '*/\n'
    },
    jshint: {
      main: [
        'Gruntfile.js', 
        'bower.json',
        'lib/**/*.js',
        'test/*.js'
      ]
    },
    bower: {
      main: {
        dest: 'dist/_bower.js',
        exclude: [
          'jquery',
          'assert'
        ]
      }
    },
    concat: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        src: [
          'lib/popbox.js'
        ],
        dest: 'dist/fidel.popbox.js'
      },
      full: {
        src: [
          'dist/_bower.js',
          'lib/popbox.js'
        ],
        dest: 'dist/popbox.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        src: 'dist/fidel.popbox.js',
        dest: 'dist/fidel.popbox.min.js'
      },
      full: {
        src: 'dist/popbox.js',
        dest: 'dist/popbox.min.js'
      }
    },
    clean: {
      bower: [
        'dist/_bower.js'
      ],
      dist: [
        'dist'
      ]
    },
    less: {
      styles: {
        files: {
          'dist/popbox.css': 'lib/default.less'
        }
      }
    },
    watch: {
      main: {
        files: '<%= jshint.main %>',
        tasks: 'scripts' 
      },
      grunt: {
        files: [
          'Gruntfile.js',
          'test/index.html'
        ],
        tasks: 'default'
      },
      styles: {
        files: 'lib/*.less',
        tasks: ['styles']
      }
    },
    mocha: {
      options: {
        run: true,
        growl: true,
        reporter: 'Spec'
      },
      all: {
        src: 'test/index.html'
      }
    },
    plato: {
      main: {
        files: {
          'reports': ['lib/*.js']
        }
      }
    },
    connect: {
      server:{
        options: {
          hostname: '*'
        }
      },
      plato: {
        port: 8000,
        base: 'reports',
        options: {
          keepalive: true
        }
      }
    },
    bytesize: {
      scripts: {
        src: [
          'dist/*'
        ]
      }
    }
  });
  require('load-grunt-tasks')(grunt);
  grunt.registerTask('styles', ['less']);
  grunt.registerTask('scripts', ['jshint', 'bower', 'concat', 'uglify', 'clean:bower', 'mocha', 'bytesize']);
  grunt.registerTask('default', ['styles', 'scripts']);
  grunt.registerTask('dev', ['connect:server', 'watch']);
  grunt.registerTask('reports', ['plato', 'connect:plato']);
};
