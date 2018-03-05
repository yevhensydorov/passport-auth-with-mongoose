const SERVER_PORT = process.env.PORT || 3000;

const express  							= require('express'),
			app      							= express(),
			ejs      							= require('ejs'),
			mongoose 							= require('mongoose'),
			passport 							= require('passport'),
			bodyParser 						= require('body-parser'),
			User									= require('./models/user'),
			LocalStrategy 				= require('passport-local'),
			passportLocalMongoose = require('passport-local-mongoose')

mongoose.connect('mongodb://localhost/auth_demo_app')

// configure user session
app.use(require('express-session')({
	secret: 'any rando, string',
	resave: false,
	saveUninitialized: false
}));

passport.use(new LocalStrategy(User.authenticate()));

// serialise user into session
passport.serializeUser(User.serializeUser());
// deserialise user from session
passport.deserializeUser(User.deserializeUser());

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// initialise passport and session
app.use(passport.initialize());
app.use(passport.session());

// helper function to check user is logged in
const isLoggedIn = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}

// =================
// ROUTES
// =================

app.get( '/', (req, res) => res.render('home') );

app.get( '/secret', isLoggedIn, (req, res) => res.render('secret') );

// Auth ROUTES

// show sign up form
app.get( '/register', (req, res) => res.render('register') );

// handling user sign up form
app.post('/register', (req, res) => {
	User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
		if(err){
			console.log(err);
			return res.render('register');
		}
		passport.authenticate('local')(req, res, () => {
			res.redirect('/secret');
		});
	})
});

// LOGIN ROUTES
app.get( '/login', (req, res) => res.render('login') );

app.post('/login', passport.authenticate('local', {
	successRedirect: '/secret',
	failureRedirect: '/login'
}), (req, res) => {
});

app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

app.listen(SERVER_PORT, () => { // Set app to listen for requests on port 3000
  console.log('Listening on port 8080!'); // Output message to indicate server is listening
});