module.exports = function(grunt) {
    var _ = grunt.utils._;
    grunt.registerTask("db", "the database.", function(prop) {
        var schema = require('../server/db');
        var done = this.async();
        schema.on('connected', function() {
            schema.autoupdate(done);
        });
    });
};
