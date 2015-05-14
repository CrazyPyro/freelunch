
console.log('Starting up...');

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var config = require('./config.js');
console.dir(config);
console.log('Configuration complete.');

// App
var app = express();
app.engine('.html', require('ejs').renderFile);

//var access_logfile = require('fs').createWriteStream(config.tempPath + '/access.log', {flags: 'a'});
app.use(require('morgan')('combined', {immediate: true})); //access logging

// Request body parsing:
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
var getRawBody = require('raw-body')
var typer = require('media-typer')
app.use(function (req, res, next) {
  getRawBody(req, 
    'utf8',
  //{
    //length: req.headers['content-length'],
    //limit: '1mb',
    //encoding: typer.parse(req.headers['content-type']).parameters.charset
  //},
  function (err, string) {
    if (err) {
      return next(err)
    }
    req.text = string
    next()
  })
});

app.get('/', function (req, res) {
	console.log('Serving homepage.');
	res.render('index.html');
});

var passport = require('passport');
//var GoogleStrategy = require('passport-google').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: config.publicUrl + "/auth/google/callback",
  },
  function(accessToken, refreshToken, profile, done) {
    //User.findOrCreate({ googleId: profile.id }, function(err, user) {
    //  done(err, user);
    //});
	  process.nextTick(function() {
      console.log('GoogleStrategy Verify callback');
	// Do something here to get user info based on the OAuth response.
      console.dir([accessToken, refreshToken, profile]);
      // Then call done(error,user) to continue.
      return done(null, {user : [accessToken, refreshToken, profile]});
	  });
  }
));
passport.serializeUser(function(user, done) {
	console.log('Serialize user:');
	done(null, user);
});
passport.deserializeUser(function(obj, done) {
	console.log('De-serialize user:');
	console.dir(obj);
	done(null, obj);
});
var session = require('express-session');
//TODO: app.set('trust proxy', 1); // For HTTPS/proxy cookie support.
app.use(session({
	genid: function(req) {
		return require('crypto').randomBytes(48).toString('hex'); // unique session IDs
	},
	resave: false,
	saveUninitialized: true,
	secret: 'keyboard cat',
	//TODO: secret: require('crypto').randomBytes(48).toString('hex');
	//TODO: cookie: { secure: true }
	//TODO: store: require('connect-mongo')(session)()
	//TODO: store: require('session-file-store')(session)()
})); // This Express session must come before the Passport session below. 
app.use(passport.initialize());
app.use(passport.session());
//TODO: Need this for sessions? app.use(require('cookie-parser')());
// This code snippet from https://github.com/jaredhanson/passport-github/
var ensureAuthenticated = function(req, res, next) {
	if (req.isAuthenticated()) {
		console.log('Allowing authenticated user.');
		return next();
	} else {
		console.log('Redirecting unauthenticated user.');
		res.redirect('/login');
	}
};
app.get('/login', function (req, res) {
        res.send('<a href="/auth/google">Log in using Google</a>');
});
app.get('/loginok', function (req, res) {
        console.log('Login OK.');
        console.dir(req.user);
        res.render('index.html');
});
app.get('/loginfail', function (req, res) {
        console.log('Login FAILED.');
        res.render('index.html');
});
//Start the auth:
// If you get a 400:invalid_redirect_uri, make sure what you have in your browser matches config.publicUrl.
app.get('/auth/google', 
	// scope per https://developers.google.com/identity/protocols/OpenIDConnect#scope-param
	passport.authenticate('google', {scope: 'openid profile email'}));
	// { scope: ['https://www.googleapis.com/auth/plus.login'] }

app.get('/auth/google/callback',
	//passport.authenticate('google', { successRedirect: '/loginok', failureRedirect: '/loginfail' }));
	function(req, res, next) {
		passport.authenticate('google',
			function(err, user, info) {
				if (err) { return next(err); }
				if (!user) { return res.redirect('/loginfail'); }
				//Note: passport.authenticate() middleware invokes req.login() automatically.
				req.logIn(user, function(err) {
					if (err) { return next(err); }
					return res.redirect('/loginok'); //?user=' + user.username);
				});
			})(req, res, next);
	});

app.get('/logout', function(req, res){
  console.log('logout');
  req.logout();
  res.redirect('/');
});

app.get('/in', ensureAuthenticated, function (req, res) {
                console.log("in test");
                res.send("test");
});

app.get('/feed', ensureAuthenticated, function(req, res) {
	res.send('<p>Choose format: <ul><li><a href="/feed/rss">RSS</a></li><li><a href="/feed/atom">Atom</a></li></ul></p>');
});

app.listen(config.PORT);
console.log('Running on http://localhost:' + config.PORT);
