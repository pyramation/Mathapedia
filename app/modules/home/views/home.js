define(['sandbox', 'auth-views'], function(sandbox, AuthViews) {

    var Views = {};

    Views.View = sandbox.mvc.View({

        template: 'home/templates/home',
        beforeRender: function() {
            this.insertView(new AuthViews.Login());
            this.insertView(new AuthViews.Forgot());

            this.insertView(new AuthViews.Signup());
        },
        afterRender: function() {
            MathJax.Hub.Typeset();
        }
    });

    return Views;

});
