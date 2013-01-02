var _ = require('underscore');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');


var s = function(req, res) {
    return function(err, inst) {
        if (err) {
            res.send(err.message, 500);
        } else if (inst) {
            res.send(inst);
        } else {
            res.send(404);
        }
    };
};

module.exports = function(app) {

    var User = app.schema.models.User;
    var Authorship = app.schema.models.Authorship;
    var Readership = app.schema.models.Readership;

    function regUser (User) {
        return function(email, password, first, last, author, callback) {

            if (typeof password !== 'string' || ! password.trim().length) {
                return callback(new Error('you must specify a password'));
            }

            if (typeof email !== 'string' || ! email.trim().length) {
                return callback(new Error('you must specify an email'));
            }

            if (typeof first !== 'string' || ! first.trim().length) {
                return callback(new Error('you must specify an first name'));
            }

            if (typeof last !== 'string' || ! last.trim().length) {
                return callback(new Error('you must specify an last name'));
            }

            if (!email.match(/^[_a-z0-9\-]+(\.[_a-z0-9\-]+)*@[a-z0-9\-]+(\.[a-z0-9\-]+)*(\.[a-z]{2,4})$/)) {
                return callback(new Error('you must specify a proper email'));
            }

            var pass = crypto.createHash('sha256').update(password).digest('hex');

            async.waterfall([
                function getUser (callback) {
                    User.findOne({where: {email:email}}, callback);
                },
                function checkExistence (user, callback) {
                    if (user) {
                        callback(new Error('That account already exists!'));
                    } else {
                        User.create({email: email, password: pass, first: first, last: last, author: author}, callback);
                    }
                },
                function sendConfirmationEmail (user, callback) {

                    var verify = crypto.createHash('sha256').update(pass + email).digest('hex');
                    var Handlebars = require('handlebars');
                    var fs = require('fs');
                    var f = fs.readFileSync('server/views/emails/verify.html').toString();
                    var template = Handlebars.compile( f );
                    var message = template( {verify: verify, email: email} );
                    var htmlMessage = message;


                    // Prepare nodemailer transport object
                    var transport = nodemailer.createTransport("SMTP", {
                        service: "Gmail",
                        auth: {
                            user: "youremail@gmail.com",
                            pass: "youmustlovemath"
                        }
                    });


                    transport.sendMail({
                        from: 'Dan Lynch <mathapedia@gmail.com>',
                        to: email,
                        replyTo: ['noreply@mathapedia.com'],
                        subject: 'Activate your Mathapedia account!',
                        html: message,
                        text: message
                    }, function(err, responseStatus) {
                        if (err) {
                            console.log(err);
                            callback(new Error('badness'));
                        } else {
                            callback(null, 200);
                        }
                    });

                }
            ], callback);

        };
    }


    var Controller = {

        users: {

            LOGOUT: function (req, res) {

                delete req.session.user;
                res.send(200);

            },

            LOGIN: function(req, res) {

                var authenticateUser = function(email, password, callback) {

                    if (typeof password !== 'string' || ! password.trim().length) {
                        return callback(new Error('you must specify a password'));
                    }

                    if (typeof email !== 'string' || ! email.trim().length) {
                        return callback(new Error('you must specify an email'));
                    }

                    var pass = crypto.createHash('sha256').update(password).digest('hex');

                    async.waterfall([
                        function getUser (callback) {
                            User.findOne({where: {email:email}}, callback);
                        },
                        function checkExistence (user, callback) {
                            if (user) {
                                if (user.password === pass) {
                                    callback(null, user);
                                } else {
                                    callback(new Error('That password is incorrect.'));
                                }
                            } else {
                                callback(new Error('That account does not exist.'));
                            }
                        },
                        function verifiedOnly (user, callback) {
                            if (user.verified) {
                                user.updateAttribute('last_login', Date.now(), callback);
                            } else {
                                callback(new Error('That account is not activated.'));
                            }
                        }
                    ], callback);

                };

                authenticateUser(req.body.email, req.body.password, function (error, user) {
                    if (error) return res.send(404);

                    async.series({
                        write: function (callback) {
                            Authorship.all({where: {user_id: user.id}}, callback);
                        },
                        read: function (callback) {
                            Readership.all({where: {user_id: user.id}}, callback);
                        }

                    }, function(e,r) {

                        user.read = _.pluck(r.read, 'book_id');
                        user.write = _.pluck(r.write, 'book_id');

                        req.session.user = user;
                        res.send({status: 200});


                    });

                });

            },

            SIGNUP: function (req, res) {

                var registerUser = regUser(User);
                try {
                    if (req.body.author.match(/1/)) {
                        registerUser(req.body.email, req.body.password, req.body.first, req.body.last, 1, s(req, res));
                    } else {
                        registerUser(req.body.email, req.body.password, req.body.first, req.body.last, 0, s(req, res));
                    }
                } catch(e) {
                    res.send(400);
                }
            },

            ACTIVATE: function (req, res) {

                var verifyUser = function (email, key, callback) {

                    var opts = {
                        where: {
                            email: email
                        }
                    };

                    async.waterfall([

                        function queryUser (callback) {
                            User.findOne(opts, callback);
                        },
                        function checkUserExists (user, callback) {
                            if (user) {
                                if (user.verified) {
                                    callback(new Error('this user is already activated'));
                                } else {
                                    callback(null, user);
                                }
                            } else {
                                callback(new Error('no such user exists.'));
                            }
                        },
                        function verifyUser (user, callback) {
                            var verify = crypto.createHash('sha256').update(user.password + email).digest('hex');

                            var check = new RegExp('^' + verify + '$');
                            if (key.match(check)) {
                                user.updateAttribute('verified', true, callback);
                            } else {
                                callback(new Error('not verified'));
                            }
                        },
                        function sendOK (user, callback) {
                            callback(null, 'you have been verified');
                        }

                    ], callback);
                };

                verifyUser(req.params.email, req.params.key, s(req, res));

            }


        }
    };


    app.get('/logout', Controller.users.LOGOUT); // read
    app.post('/login', Controller.users.LOGIN); // read
    app.post('/signup', Controller.users.SIGNUP); // read
    app.get('/verify/:key/:email', Controller.users.ACTIVATE); // read

}
