define(['sandbox'], function(sandbox) {

    var Views = {};

    Views.Login = sandbox.mvc.View({
        template: 'home/templates/login',
        events: {
            'submit .login-form': 'login'
        },
        login: function(event) {

            $.post('/login', {

                email: $('.login-form input[name=email]').val(),
                password: $('.login-form input[name=password]').val()

            }, function(data) {


                if (data.status === 200) {
                    Backbone.history.navigate('/books', true);
                } else {
                    alert('sorry something went wrong');
                }


            });

            event.preventDefault();
            event.stopPropagation();
        }
    });

    Views.Forgot = sandbox.mvc.View({
        template: 'home/templates/forgot-password',
        events: {
            'submit .forgot-form': 'forgot'
        },
        forgot: function(event) {

            $.post('/forgot', {

                email: $('.forgot-form input[name=email]').val()

            }, function(data) {


            });

            event.preventDefault();
            event.stopPropagation();
        }
    });

  Views.Signup = sandbox.mvc.View({
        template: 'home/templates/signup-form',
        events: {
            'submit .signup-form':'signup'
        },
        signup: function(event) {


            var formData = {

                email: $('.signup-form input[name=email]').val(),
                first: $('.signup-form input[name=first]').val(),
                last: $('.signup-form input[name=last]').val(),
                password: $('.signup-form input[name=password]').val(),
                author: $('.signup-form select[name=author]').val()
               
            };


            $.post('/signup', formData, function(data) {

                alert('great, you will receive an email shortly!');

            });


            event.preventDefault();
            event.stopPropagation();
        }
    });

    return Views;

});
