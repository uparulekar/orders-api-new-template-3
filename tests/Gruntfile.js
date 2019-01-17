'use strict';

var _ = require('lodash');

var desireds = require('./desireds');

var gruntConfig = {
    env: {
        test: {
            // dynamically filled
        }
    },
    mochaTest: {
        'server-side': {
            options: {
                reporter: 'XUnit',
                clearRequireCache: true,
                colors: true,
                quite: true,
                captureFile: 'tests/server/mochatest.xml',
                gruntLogHeader: false
            },
            src: ['tests/server/*.spec.js']
        },
        'server-side-spec': {
            options: {
                reporter: 'spec',
                clearRequireCache: true,
                colors: true,
                quite: true
            },
            src: ['tests/server/*.spec.js']
        },
        'fvt': {
            options: {
                reporter: 'XUnit',
                clearRequireCache: true,
                colors: true,
                quite: true,
                captureFile: 'tests/fvt/mochafvttest.xml'
            },
            src: ['tests/fvt/*.spec.js']
        },
        'fvt-spec': {
            options: {
                reporter: 'spec',
                clearRequireCache: true,
                colors: true,
                quite: true
            },
            src: ['tests/fvt/*.spec.js']
        },
        'integration-test': {
            options: {
                reporter: 'XUnit',
                clearRequireCache: true,
                colors: true,
                quite: true,
                captureFile: 'tests/integration_tests/mocha_integration_test.xml'
            },
            src: ['tests/integration_tests/*.spec.js']
        }
    },

    clean: {
        options: {
            force: true,
            expand: true
        },
        coverage: ['tests/server/coverage', 'tests/server/mochatest.json', 'tests/fvt/mochafvttest.json']
    },

    copy: {
        resourcesForInstrumented: {
            nonull: true,
            files: [{
                expand: true,
                dest: 'tests/server/coverage/instrumented',
                src: ['routes/db.js']
            }]
        }
    },

    instrument: {
        files: ['routes/orders.js'],
        options: {
            lazy: false,
            basePath: 'tests/server/coverage/instrumented/'
        }
    },

    storeCoverage: {
        options: {
            dir: 'tests/server/coverage/reports'
        }
    },

    makeReport: {
        src: 'tests/server/coverage/reports/*.json',
        options: {
            type: 'html',
            type: 'json-summary',
            dir: 'tests/server/coverage/reports',
            file: 'coverage-summary.json'
            //print: 'detail'
        }
    },

    'makeReport-lcov': {
        src: 'tests/server/coverage/reports/*.json',
        options: {
            type: 'lcov',
            dir: 'tests/server/coverage/reports'
        }
    },
    simplemocha: {
        sauce: {
            options: {
                timeout: 60000,
                reporter: 'spec-xunit-file',
            },
            src: ['tests/sauce_actual/test-cases.js']
        },
        sauce_node: {
            options: {
                timeout: 60000,
                reporter: 'spec-xunit-file',
            },
            src: ['tests/sauce/test-cases.js']
        }
    },
    jshint: {
        options: {
            jshintrc: '.jshintrc'
        },
        gruntfile: {
            src: 'Gruntfile.js'
        },
        test: {
            options: {
                jshintrc: 'test/.jshintrc'
            },
            src: ['test/*.js']
        },
    },
    concurrent: {
        'test-sauce': [], // dynamically filled
    },
    watch: {
        gruntfile: {
            files: '<%= jshint.gruntfile.src %>',
            tasks: ['jshint:gruntfile']
        },
        test: {
            files: '<%= jshint.test.src %>',
            tasks: ['jshint:test']
        },
    },
};
_.forIn(desireds, function (desired, key) {
    gruntConfig.env[key] = {
        DESIRED: JSON.stringify(desired)
    };
    //gruntConfig.concurrent['test-sauce'].push('test:sauce:' + key);
});

//console.log(gruntConfig);

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig(gruntConfig);

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-istanbul');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');


    grunt.renameTask('makeReport', 'makeReport-lcov');
    grunt.loadNpmTasks('grunt-istanbul');
    grunt.registerTask('dev-test', ['env:test', 'clean:coverage', 'copy:resourcesForInstrumented', 'instrument', 'mochaTest:server-side-spec']);
    grunt.registerTask('dev-test-cov', ['env:test', 'clean:coverage', 'copy:resourcesForInstrumented', 'instrument', 'mochaTest:server-side', 'storeCoverage', 'makeReport-lcov', 'makeReport']);
    grunt.registerTask('dev-fvtspec', ['env:test', 'clean:coverage', 'mochaTest:fvt-spec']);
    grunt.registerTask('dev-fvt', ['env:test', 'clean:coverage', 'mochaTest:fvt']);
    grunt.registerTask('dev-integration-test', ['env:test', 'clean:coverage', 'mochaTest:integration-test']);
    grunt.registerTask('test_real', ['env:chrome', 'simplemocha:sauce:' + _(desireds).keys().first()]);
    grunt.registerTask('test_fake', ['env:chrome', 'simplemocha:sauce_node:' + _(desireds).keys().first()]);
};
