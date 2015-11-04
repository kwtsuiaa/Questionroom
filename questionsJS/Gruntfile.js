"use strict";

module.exports = function(grunt) {

grunt.initConfig({
  jshint: {
    all: ['Gruntfile.js',
          'js/*.js',
          'js/controllers/*.js',
          'js/filters/*.js',
          'test/**/*.js'],
    options: {
      "-W097":true,
        globals: {
          jQuery: true,
          describe: true,
          it: true,
          expect: true,
          beforeEach: true,
          Autolinker: true,
          inject: true,
          module: true,
          console: true
        }
    }
  },


uglify: {
    my_target: {
      files: {
        'dist/handsup.min.js': ['js/*.js', 'js/conrollers/*.js', 'js/filters/*.js']
      }
    }
  },

    // Test settings
  karma: {
        unit: {
          configFile: 'karma.conf.js',
          singleRun: true,
        }
  },

  watch: {
       files: ['<%= jshint.files %>'],
       tasks: ['jshint']
  },

  protractor: {
    options: {
        args: {
        // Arguments passed to the command
      }
    },
    all: {   // Grunt requires at least one target to run so you can simply put 'all: {}' here too.
      options: {
        configFile: "protractor.conf.js", // Target-specific config file
        args: {} // Target-specific arguments
      }
    },
  },

});


grunt.registerTask('test', ['jshint', 'karma']);

grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-karma');

// npm install grunt-protractor-runner --save-dev
grunt.loadNpmTasks('grunt-protractor-runner');

// npm install grunt-contrib-uglify --save-dev
grunt.loadNpmTasks('grunt-contrib-uglify');

};
