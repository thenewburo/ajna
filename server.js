var express     = require('express');
var app         = express();
var port 		= 8080;
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var cors 		= require('cors');
var bcrypt		= require('bcrypt-nodejs');

var jwt    		= require('jsonwebtoken'); // used to create, sign, and verify tokens
var config 		= require('./server/config'); // get our config file
var User   		= require('./server/models/user'); // get our user mongoose model
    
// =======================
// Configuration =========
// =======================
app.all('*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});
// connect to database
mongoose.connect(config.database);
// secret variable
app.set('superSecret', config.secret);
// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
// use morgan to log requests to the console
app.use(morgan('dev'));

// =======================
// Routes ================
// =======================
// route to create a new user in our database
app.post('/createAccount', function(req, res) {
	// One of the fields is empty
	if (req.body == undefined || req.body.username == undefined || req.body.username.length <= 0 ||
		req.body.email == undefined || req.body.email.length <= 0 ||
		req.body.password == undefined || req.body.password.length <= 0)
		return res.status(400).json({ title: "NEWACCOUNT.New-account", message: "ERROR.Error-fields" });
	// Check email address is well formated
	var patt = /\S+@\S+\.\S+/;
	if (patt.test(req.body.email) == false)
		return res.status(400).json({ title: "NEWACCOUNT.New-account", message: "ERROR.Email-incorrect" });
	// Check email address already used
	User.findOne({ email: req.body.email }, function (err, person) {
		if (err) return res.status(400).json({ title: "NEWACCOUNT.New-account", message: "ERROR.Error-occurred" });
		// The email is already used
		if (person != null)
			return res.status(400).json({ title: "NEWACCOUNT.New-account", message: "ERROR.Email-used" });
		// Email is good, we can create the user
		else {
			// Create the new user
			var newUser = new User({
				name: req.body.username,
				email: req.body.email.toLowerCase(),
				password: req.body.password
			});
			// bcrypt the password
			bcrypt.hash(newUser.password, null, null, function(err, hash) {
				if (err) return res.status(400).json({ title: "NEWACCOUNT.New-account", message: "ERROR.Error-occurred" });
				newUser.password = hash;
				// Save the user in database
				newUser.save(function(err) {
					if (err) return res.status(400).json({ title: "NEWACCOUNT.New-account", message: "ERROR.Cannot-connect" });
					// User successfully created
					res.sendStatus(200);
				});
			});
		}
	})
});

// route to authenticate a user
app.post('/connect', function(req, res) {

	// One of the fields is empty
	if (req.body == undefined || req.body.email == undefined || req.body.email.length <= 0 ||
		req.body.password == undefined || req.body.password.length <= 0)
		return res.status(400).json({ title: "LOGIN.Sign-in", message: "ERROR.Error-fields" });

	// find the user
	User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
    	if (err) throw err;
    	// User not found
		if (!user)
			return res.status(400).json({ title: "LOGIN.Sign-in", message: "ERROR.Cannot-connect" });
		// User found
		else {
			// check if password matches
			bcrypt.compare(req.body.password, user.password, function(err, result) {
				// it matches
				if (result) {
					// create a token
					var token = jwt.sign({ name: user.name, email: user.email }, app.get('superSecret'), {
						expiresIn: "24h" // expires in 24 hours
					});
					// return the information including token as JSON
					return res.status(200).json({ name: user.name, email: user.email, token: token });
				}
				else
					return res.status(400).json({ title: "LOGIN.Sign-in", message: "ERROR.Cannot-connect" });
			});
		}
	});
});

// =======================
// API Routes ============
// =======================
// This contains all the requests that need authentication

// get an instance of the router for api routes
var apiRoutes = express.Router(); 

// route middleware to verify a token
apiRoutes.use(function(req, res, next) {
	// check header or url parameters or post parameters for token
	var token = req.headers['authorization'];

	// decode token
	if (token) {
		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
			if (err)
				return res.status(400).json({ title: "ERROR.Error", message: "ERROR.Error-token" });
			else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;    
				next();
			}
		});
	}
	else {
		// if there is no token, we return an error
		return res.status(403).json({ title: "ERROR.Error", message: "ERROR.Error-token" });
	}
});

apiRoutes.get('/authenticated', function(req, res) {
	res.sendStatus(200);
});

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// =======================
// Start the server ======
// =======================
app.listen(port);
console.log("Running at Port " + port + " ...");