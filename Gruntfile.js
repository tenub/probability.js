module.exports = function (grunt) {

	var pkg = require('./package.json');

	grunt.pkg = {
		name: encodeURIComponent(pkg.name.toLowerCase()),
		version: pkg.version,
		type: pkg.type,
		paths: {
			js: 'js',
			amd: 'amd'
		}
	};

	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-cleanempty');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-csslint');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-jsdoc');

	grunt.registerTask('default', ['tasks']);
	grunt.registerTask('tasks', function() {
		grunt.log.subhead('Please choose a grunt task:');
		grunt.log.ok('"grunt build" - builds assets');
	});
	grunt.registerTask('build', function(n) {
		if (n && n === 'sass') {
			grunt.task.run(['clean', 'csslint:lax', 'jshint', 'concat', 'autoprefixer', 'cleanempty', 'uglify', 'copy']);
		} else {
			grunt.loadNpmTasks('grunt-contrib-sass');
			grunt.task.run(['clean', 'sass', 'csslint:lax', 'jshint', 'concat', 'autoprefixer', 'cleanempty', 'uglify', 'copy']);
		}
	});
	grunt.registerTask('doc', 'jsdoc:all');

	grunt.initConfig({

		'clean': {
			all: ['build', 'dist']
		},

		'sass': {
			assets: {
				files: [{
					expand: true,
					flatten: true,
					cwd: 'src',
					src: ['**/*.scss'],
					dest: 'build/css',
					ext: '.css'
				}]
			}
		},

		'csslint': {
			strict: {
				options: {
					'import': 2
				},
				src: ['src/**/*.css', 'build/css/*.css']
			},
			lax: {
				options: {
					'adjoining-classes': false,
					'box-sizing': false,
					'box-model': false,
					'fallback-colors': false,
					'floats': false,
					'font-sizes': false,
					'ids': false,
					'import': false,
					'known-properties': false,
					'outline-none': false,
					'overqualified-elements': false,
					'qualified-headings': false,
					'unique-headings': false,
					'universal-selector': false,
					'unqualified-attributes': false
				},
				src: ['src/**/*.css']
			}
		},

		'jshint': {
			all: [
				'Gruntfile.js',
				'src/**/*.js'
			]
		},

		'jsdoc': {
			all: {
				src: ['src/**/*.js'],
				options: {
					destination: 'doc'
				}
			}
		},

		'concat': {
			css: {
				src: ['src/**/*.css', 'build/css/*.css'],
				dest: 'dist/assets/css/main.css'
			}
		},

		'autoprefixer': {
			no_dest: {
				src: 'dist/assets/css/main.css'
			}
		},

		'cleanempty': {
			dist: {
				src: ['build/**/*', 'dist/**/*']
			},
		},

		'cssmin': {
			css: {
				files: {
					'dist/assets/css/main.min.css': [
						'build/css/main.css'
					]
				}
			}
		},

		'uglify': {
			options: {
				mangle: false
			},
			all: {
				files: [{
					expand: true,
					cwd: 'src/js',
					src: ['**/*.js'],
					dest: 'dist/assets/js',
					ext: '.min.js'
				}]
			}
		},

		'copy': {
			html: {
				files: [
					{
						expand: true,
						flatten: true,
						dest: 'dist',
						src: 'src/**/*.html'
					}
				]
			},
			images: {
				files: [
					{
						expand: true,
						flatten: true,
						dest: 'dist/assets/img/<%= grunt.pkg.name %>/',
						src: 'src/img/*'
					},
					{
						expand: true,
						flatten: true,
						dest: 'build/assets/img/<%= grunt.pkg.name %>/',
						src: 'src/img/*'
					}
				]
			}
		}

	});

};