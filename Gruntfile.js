module.exports = function(grunt) {
	var pkg = require("./package.json");

	grunt
			.initConfig({
				pkg : pkg,

				watch : {
					all : {
						files : [ 'src/**/*.*', 'test/**/*.*' ],
						tasks : [ 'default' ]
					},
				},
				jasmine_node : {
					specNameMatcher : "Spec",
					specFolders : [ "test/spec" ],
					projectRoot : "test/spec",
					forceExit : true,
				},
				jshint : {
					all : [ 'Gruntfile.js', 'src/**/*.js', 'spec/**/*.js' ],
					options : {
						jshintrc : '.jshintrc',
					}
				},
				browserify : {
					main : {
						src : [ 'src/Spritz.js' ],
						dest : 'dist/spritz_bundle.js'
					},
					src : {
						src : [ 'src/**/*.js' ],
						dest : 'dist/spritz_bundle_src.js',
//						options : {
//							require : expand([ './src/**/*.js' ])
//						}
				},
					test : {
						src : [ 'spec/**/*.js' ],
						dest : 'dist/spritz_bundle_test.js',
//						options : {
//							external : [ 'src/**/*.js' ],
//						}
					},
				},
				jasmine : {
					src : 'dist/spritz_bundle_src.js',
					options : {
						specs : 'dist/spritz_bundle_test.js'
					}
				},
				uglify : {
					all : {
						files : {
							'dist/spritz_bundle_min.js' : [ 'dist/spritz_bundle_src.js' ]
						}
					},
					main : {
						files : {
							'dist/app_bundle_main_min.js' : [ 'dist/spritz_bundle.js' ]
						}
					}
				}
			});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-jasmine-node');

	// Default task.
	grunt.registerTask('default', [ 'jasmine_node', 'browserify',
			'jasmine', 'uglify' ]);

};
