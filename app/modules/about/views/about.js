define(['sandbox'], function(sandbox) {

    var Views = {};

    Views.View = sandbox.mvc.View({

        template: 'about/templates/about',
        afterRender: function() {
            MathJax.Hub.Typeset();
        }

    });

    return Views;

});
