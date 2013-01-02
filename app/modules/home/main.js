define(['sandbox','home-views'], function(sandbox, Views) {


	var Home = sandbox.Module({

        start: function() {
         sandbox.subscribe('render:home', 'home', this.render, this);
        },
        render: function() {
            var v = new Views.View();
            sandbox.publish('render', 'home', v);
        }

	});

	return new Home();

});
