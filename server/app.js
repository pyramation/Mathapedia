
/**
 * Module dependencies.
 */

var express = require('express')
  , params = require('express-params')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
;

// database schema
var schema = require('./db');



/**
* SERVER
*/

var app = express();
params.extend(app); // use express-params

app.configure(function(){
  app.set('port', process.env.PORT || 9000);
  app.set('views', __dirname + '/views');

  app.use(express.static(__dirname + '/../'));

  app.set("view options", {layout: false});
  app.engine('html', require('ejs').renderFile);

  app.use(express.logger({ format: ':method :url' }));
  
  app.use(express.favicon());
  app.use(express.bodyParser());

  app.use(express.cookieParser('mathapedia'));
  app.use(express.session({ secret: 'mathapedia', cookie: { expires: false }}));

  app.use(express.methodOverride());
  app.use(app.router);

});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.schema = schema;

// get the API 
require('./api')(app, routes);
require('./routes/users')(app);

var r = {
  development: '/app/assets/js/libs/require.js',
  release: '/dist/release/require.js'
};

var c = {
  development: '/app/assets/css/develop.css',
  release: '/dist/release/index.css'
};

var indexRequire = process.env.RELEASE ? r.release : r.development;
var indexCSS = process.env.RELEASE ? c.release : c.development;

var freshRequest = function(req, res){
  res.render('index.html', {require: indexRequire, css: indexCSS});
};
app.get('*', freshRequest);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
