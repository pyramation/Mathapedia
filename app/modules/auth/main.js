define(['sandbox','auth-views'], function(sandbox, Views) {


	var Auth = sandbox.Module({

        start: function() {
         sandbox.subscribe('render:auth', 'auth', this.render, this);
        },
        render: function() {
            var v = new Views.View();
            sandbox.publish('render', 'auth', v);
        }

	});

	return new Auth();

});
