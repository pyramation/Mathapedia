define(['sandbox', 'latex-views'], function(sandbox, Views) {

    var LaTeX = sandbox.Module({

        start: function() {
            sandbox.subscribe('render:latex', 'latex', this.render, this);
        },
        render: function() {

            var v = new Views.View();
            sandbox.publish('render', 'latex', v);
        }

    });

    return new LaTeX();

});
