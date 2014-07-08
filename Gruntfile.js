require('colours')

module.exports = function(grunt) {
	var pkg = require("./package.json");

	grunt.initConfig({
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
            all : [ 'Gruntfile.js', 'src/**/*.js', 'test/**/*.js' ],
            options : {
                jshintrc : '.jshintrc',
            }
        },
        browserify : {
            main : {
                src : [ 'src/Spritz.js' ],
                dest : 'dist/spritzr_bundle.js'
            },
            src : {
                src : [ 'src/**/*.js' ],
                dest : 'dist/spritzr_bundle_src.js',

            },
            test : {
                src : [ 'test/spec/**/*.js' ],
                dest : 'dist/spritzr_bundle_test.js',
            },
        },
        jasmine : {
            src : 'dist/spritzr_bundle_src.js',
            options : {
                specs : 'dist/spritzr_bundle_test.js'
            }
        },
        uglify : {
            all : {
                files : {
                    'dist/spritzr_bundle_min.js' : [ 'dist/spritzr_bundle_src.js' ]
                }
            },
            main : {
                files : {
                    'dist/app_bundle_main_min.js' : [ 'dist/spritzr_bundle.js' ]
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
    
    grunt.registerTask('browserstack', 'Browserstack runner', function() {
        var done = this.async()
        require('child_process').exec('browserstack-runner', function(error, stdout, stderr) {
            console.log(error, stdout, stderr)
            if (error) {
                console.log('Failed due to error'.red)
                console.log(error.toString)
                return done(error)
            }
            if (stderr) {
                console.log('Failed due to test error'.red)
                console.log(stderr)
                return done(stderr)
            }
            console.log('Browser tests passed!'.green)
            console.log(stdout)
            done()
        })
    })

	// Default task.
	grunt.registerTask('default', [ 'jasmine_node', 'browserify',
			'jasmine', 'uglify' ]);
    
    grunt.registerTask('ci-test', [ 'default', 'browserstack' ])

};
