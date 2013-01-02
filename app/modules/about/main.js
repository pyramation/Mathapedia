define(['sandbox','about-views'], function(sandbox, Views) {


	var About = sandbox.Module({

        start: function() {
         sandbox.subscribe('render:about', 'about', this.render, this);
        },
        render: function() {
            var v = new Views.View();
            sandbox.publish('render', 'about', v);
        }

	});

	return new About();

});
