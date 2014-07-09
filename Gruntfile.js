require('colours');

module.exports = function(grunt) {
	var pkg = require("./package.json");

	grunt.initConfig({
		pkg : pkg,

		watch : {
			all : {
				files : [ 'src/**/*.*', 'test/**/*.*' ],
				tasks : [ 'clean', 'browserify' ],
				options : {
					livereload: true
				}
			},
		},
		jasmine_node : {
			specNameMatcher : "Spec",
			specFolders : [ "test/spec" ],
			projectRoot : "test/spec",
			forceExit : true,
		},
		jshint : {
			all : [ 'Gruntfile.js', 'src/**/*.js', 'test/**/*.js' ],
			options : {
				jshintrc : '.jshintrc',
			}
		},
		browserify : {
			main : {
				src : [ 'src/Spritzr.js' ],
				dest : 'dist/spritzr.js',
				options : {
					bundleOptions : {
						standalone : 'Spritzr'
					}
				}
			},
			src : {
				src : [ 'src/**/*.js' ],
				dest : 'dist/spritzr_src.js',

			},
			test : {
				src : [ 'test/spec/**/*.js' ],
				dest : 'dist/spritzr_test.js',
				options : {
					bundleOptions : {
						debug : true
					}
				}
			},
		},
		jasmine : {
			src : 'dist/spritzr_src.js',
			options : {
				specs : 'dist/spritzr_test.js'
			}
		},
		uglify : {
			all : {
				files : {
					'dist/spritzr.min.js' : [ 'dist/spritzr_src.js' ]
				}
			},
			main : {
				files : {
					'dist/spritzr.min.js' : [ 'dist/spritzr.js' ]
				}
			}
		},
		clean : [ "dist" ],
		bower : {
			install : {}
		},
		connect : {
			server : {
				options : {
					livereload: true,
					open: 'http://localhost:8000/test/test.html'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-jasmine-node');
	grunt.loadNpmTasks('grunt-bower-task');
	grunt.loadNpmTasks('grunt-contrib-connect');

	grunt.registerTask('browserstack', 'Browserstack runner', function() {
		var done = this.async();
		require('child_process').exec('browserstack-runner --verbose',
				function(error, stdout, stderr) {
					if (error) {
						console.log('Failed due to error'.red);
						console.log(error.toString());
						if (stdout)
							console.log(stdout);
						return done(error);
					}
					if (stderr) {
						console.log('Failed due to test error'.red);
						console.log(stderr);
						return done(stderr);
					}
					console.log('Browser tests passed!'.green);
					console.log(stdout);
					done();
				});
	});

	// Default task.
	grunt.registerTask('default', [ 'clean', 'jasmine_node', 'browserify',
			'jasmine', 'uglify' ]);

	grunt.registerTask('ci-test',
			[ 'default', 'bower:install', 'browserstack' ]);

	grunt.registerTask('browser-test', [ 'clean', 'browserify', 'connect', 'watch' ]);
};
