/**
 * Grunt file
 */
var autoprefixer = require('autoprefixer-core'),
    cssURLs = require('postcss-url');

module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),
            // Set project object
            project: {
                app: '<%= pkg.name %>',
                assets: 'assets',
                images: '<%= project.assets %>/images',
                banner: '',
                themeBanner: '/* \n'+
                             'Theme Name: <%= pkg.themeName %> \n' +
                             'Version: <%= pkg.version %> \n' +
                             'Theme URI: <%= pkg.author.url %>\n' +
                             'Author: <%= pkg.author.name %>\n' +
                             'Author URI: <%= pkg.author.url %>\n' +
                             'Description: <%= pkg.description %>\n' +
                             'Text domain: <%= pkg.name %>\n' +
                             '/* \n',
                css: [
                    '<%= project.assets %>/css/'
                ],
                sass: [
                    '<%= project.assets %>/css/sass/'
                ],
                js: [
                    '<%= project.assets %>/js/'
                ],
                dist: [
                    'dist/'
                ]
            },
            usebanner: {
                build: {
                    options: {
                        position: 'top',
                        banner: '<%= project.themeBanner %>'
                    },
                    files: {
                        src: 'style.css'
                    }
                }
            },
            sass: {
                bootstrap: {
                    options: {
                        style: 'expanded',
                        sourcemap: 'none'
                    },
                    files: {
                        '<%= project.css %>bootstrap.css': '<%= project.sass %>bootstrap-custom.scss'
                    }
                },
                dev: {
                    options: {
                        style: 'expanded',
                        sourcemap: 'none'
                    },
                    files: {
                        '<%= project.css %>dev.css': '<%= project.sass %>styles.scss'
                    }
                },
                prod: {
                    options: {
                        style: 'compressed',
                        sourcemap: 'none'
                    },
                    files: {
                        '<%= project.css %><%= project.app %>.min.css': '<%= project.sass %><%= project.app %>.scss'
                    }
                }
            },

            postcss: {
                /*build:{
                    options: {
                        map: false,
                        processors: [
                            cssBanner({
                                footer: ' \n' +
                                    'Theme Name: Theme Name \n' +
                                    'Version: <%= pkg.version %> \n' +
                                    'Theme URI: http://trmdigital.com\n' +
                                    'Author: <%= pkg.author %> \n' +
                                    'Author URI: https://trmdigital.com\n' +
                                    'Description: <%= pkg.description %> \n' +
                                    'Text domain: <%= pkg.name %>\n'
                            })
                        ]
                    },
                    src: 'style.css',
                    dest: 'style.css'
                },*/
                dev: {
                    options: {
                        map: false,
                        processors: [
                            cssURLs({
                                url :"rebase"
                            })
                        ]
                    },
                    src: '<%= project.css %>dev.css',
                    dest: '<%= project.css %>dev.css'
                },
                dist: {
                    options: {
                        map: true,
                        processors: [
                            autoprefixer({
                                browsers: ['> 0.5%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
                            }), // add vendor prefixes
                            cssURLs({
                                url :"rebase"
                            })
                        ]
                    },
                    src: '<%= project.css %><%= project.app %>.min.css',
                    dest: '<%= project.dist %><%= project.app %>.min.css'
                }
            },

            jshint: {
                options: {
                    node: true
                },
                files: [
                    'Gruntfile.js',
                    '<%= project.js %>app/*.js',
                    '<%= project.js %>main.js'
                ]
            },
            concat: {
                libs: {
                    src: [
                        'assets/js/libs/modernizr.min.js',
                        'bower_components/angular/angular.min.js',
                        'bower_components/angular-ui-router/release/angular-ui-router.min.js',
                        'bower_components/ui-router-extras/release/ct-ui-router-extras.min.js',
                        'bower_components/ui-router-extras/release/modular/ct-ui-router-extras.core.min.js',
                        'bower_components/ui-router-extras/release/modular/ct-ui-router-extras.future.min.js',
                        'bower_components/angular-resource/angular-resource.min.js'
                    ],
                    dest: '<%= project.js %><%= project.app %>-libs.js'
                },
                dev: {
                    src: [
                        '<%= project.js %>app.js',
                        '<%= project.js %>app/controllers/*.js',
                        '<%= project.js %>app/directives/*.js',
                        '<%= project.js %>app/services/*.js',
                        '<%= project.js %>app/filters/*.js'
                    ],
                    dest: '<%= project.js %><%= project.app %>-app.js'
                },
                dist: {
                    src: [
                        '<%= concat.libs.dest %>',
                        '<%= concat.dev.dest %>'
                    ],
                    dest: '<%= project.js %><%= project.app %>.js'
                },
                sass: {
                    src: [
                        '<%= project.sass %>bootstrap-custom.scss',
                        '<%= project.sass %>styles.scss'
                    ],
                    dest: '<%= project.sass %><%= project.app %>.scss'
                }
            },
            uglify: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> | <%= pkg.author %> */\n',
                    mangle: false
                },

                app: {
                    files: {
                        '<%= project.dist %><%= project.app %>.min.js' : '<%= concat.dist.dest %>'
                    }
                }
            },

            watch: {
                css: {
                    files: ['<%= project.sass %>**/*.scss', '!<%= project.sass %>vendors/*.scss', '!<%= project.sass %>bootstrap-custom.scss'],
                    tasks: ['sass:dev', 'postcss:dev']
                },
                bootstrap: {
                    files: ['<%= project.sass %>vendors/*.scss', '<%= project.sass %>bootstrap-custom.scss'],
                    tasks: ['sass:bootstrap']
                },
                js: {
                    files: [
                        '<%= project.js %>app/**/*.js',
                        '<%= project.js %>app.js'
                    ],
                    tasks: ['jshint', 'concat:libs', 'concat:dev']
                },
                php: {
                    files: [
                        ['*.php', '_inc/*.php', 'templates/*.php', 'partials/*.php']
                    ]
                },
                options: {
                    livereload: true
                }
            }
        }
    );

    grunt.loadNpmTasks('grunt-banner');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('build', ['usebanner:build']); //Creates Wordpress stylesheet with details from package.json
    grunt.registerTask('default', ['sass:dev', 'sass:bootstrap', 'postcss:dev', 'jshint', 'concat:libs', 'concat:dev', 'watch']);
    grunt.registerTask('prod', ['jshint', 'concat:dist', 'concat:sass', 'sass:prod', 'postcss:dist', 'uglify']);
};