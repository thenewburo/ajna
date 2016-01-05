var express     = require('express');
var app         = express();
var port 		= 8080;
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var cors 		= require('cors');
var bcrypt		= require('bcrypt-nodejs');
// used to create, sign, and verify tokens
var jwt    		= require('jsonwebtoken');
// get our config file
var config 		= require('./server/config');
// get our mongoose models
var User   		= require('./server/models/user');
var Tag   		= require('./server/models/tag');
var Deck   		= require('./server/models/deck');
var Store 		= require('./server/models/store');
    
// =======================
// Configuration =========
// =======================
// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
// connect to database
mongoose.connect(config.database);
// secret variable
app.set('superSecret', config.secret);
// use morgan to log requests to the console
app.use(morgan('dev'));
// how many decks we get for each request (deckstore only)
var numberDecksPerPage = 4;

app.all('*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

// =======================
// Routes ================
// =======================
// route to create a new user in our database
app.post('/createAccount', function(req, res) {
	// One of the fields is empty
	if (req.body.username == undefined || req.body.username.length <= 0 ||
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
			var newUser = new User({ name: req.body.username, email: req.body.email.toLowerCase(), password: req.body.password, decks: [] });
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
	if (req.body.email == undefined || req.body.email.length <= 0 || req.body.password == undefined || req.body.password.length <= 0)
		return res.status(400).json({ title: "LOGIN.Sign-in", message: "ERROR.Error-fields" });

	// find the user
	User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
    	if (err) return res.status(400).json({ title: "LOGIN.Sign-in", message: "ERROR.Cannot-connect" });
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

// ----------------------------------
// Athentication
// ----------------------------------
// 
// route middleware to verify a token
apiRoutes.use(function(req, res, next) {
	// check header or url parameters or post parameters for token
	var token = req.headers['authorization'];

	// decode token
	if (token) {
		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
			if (err)
				return res.sendStatus(400);
			else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;    
				next();
			}
		});
	}
	else {
		// if there is no token, we return an error
		return res.sendStatus(403);
	}
});
// route to verify a user is connected (valid token)
apiRoutes.get('/authenticated', function(req, res) {
	res.sendStatus(200);
});



// ----------------------------------
// Add, remove, get, save and buy decks
// ----------------------------------
// 
// route to add a deck in the user's list of decks
apiRoutes.post('/addDeck', function(req, res) {
	// One of the fields is empty
	if (req.decoded == undefined || req.decoded.email == undefined || req.decoded.email.length <= 0 || req.body.deck == undefined)
		return res.sendStatus(400);

	// find the user
	User.findOne({ email: req.decoded.email.toLowerCase() }, function(err, user) {
    	if (err) return res.sendStatus(400);
    	// User not found
		if (!user)
			return res.sendStatus(400);
		// User found
		else {
			// create the new deck object
			var newDeck = new Deck({
				name: req.body.deck.name,
				cards: [],
				tags: [] });
			// put all the tags id
			for (index in req.body.deck.tags)
				newDeck.tags.push(req.body.deck.tags[index]);
			// save it in database
			newDeck.save(function(err) {
				if (err) return res.sendStatus(400);
				// Deck successfully created
				// updating the user
				user.decks.push(newDeck._id);
				user.save(function(err) {
					if (err) return res.sendStatus(400);
					// User successfully created
					res.status(200).json({ deck: newDeck });
				});
			});
		}
	});
});
// route to buy a deck
apiRoutes.post('/buyDeck', function(req, res) {
	// One of the fields is empty
	if (req.decoded == undefined || req.decoded.email == undefined || req.decoded.email.length <= 0 ||
		req.body.storeElement == undefined || req.body.storeElement._id == undefined)
		return res.sendStatus(400);

	// find the user
	User.findOne({ email: req.decoded.email.toLowerCase() }, function(err, user) {
    	if (err) return res.sendStatus(400);
    	// User not found
		if (!user)
			return res.sendStatus(400);
		// User found
		else {
			// Add the deck in the owned deck(s) list
			user.ownedDecks.push(req.body.storeElement._id);
			// Save the user in database
			user.save(function(err) {
				if (err) return res.sendStatus(400);
				// User successfully updated
				return res.sendStatus(200);
			});
		}
	});
});
// route to get all the user's deck(s) and owned deck(s)
apiRoutes.get('/getDecks', function(req, res) {
	// One of the fields is empty
	if (req.decoded == undefined || req.decoded.email == undefined || req.decoded.email.length <= 0)
		return res.sendStatus(400);

	// find the user
	User.findOne({ email: req.decoded.email.toLowerCase() })
		.populate('decks')
		.populate('ownedDecks')
		.exec(function(err, user) {
    	if (err) return res.sendStatus(400);
    	// User not found
		if (!user)
			return res.sendStatus(400);
		// User found
		else
			return res.status(200).json({ decks: user.decks, ownedDecks: user.ownedDecks });
	});
});
// route to delete a user's deck
apiRoutes.post('/deleteDeck', function(req, res) {
	// One of the fields is empty
	if (req.decoded == undefined || req.decoded.email == undefined || req.decoded.email.length <= 0 ||
		req.body.deck == undefined)
		return res.sendStatus(400);
	// find the user
	User.findOne({ email: req.decoded.email.toLowerCase() }, function(err, user) {
    	if (err) return res.sendStatus(400);
    	// User not found
		if (!user)
			return res.sendStatus(400);
		// User found
		else {
			// Remove the deck from the user table
			for (index in user.decks) {
				if (user.decks[index] == req.body.deck._id) {
					user.decks.splice(index, 1);
				}
			}
			// Update the user in database
			user.save(function(err) {
				if (err) return res.sendStatus(400);
				// Check if we can remove the deck from the deck table (we keep it if it is/was online)
				Deck.findOne({ '_id': req.body.deck._id }, function(err, deck) {
					if (!err)
						Deck.find({ '_id': req.body.deck._id }).remove().exec();
					// since we only store deck ID in the user's list, we need to retrive all the decks from the database
					Deck.find({ '_id': { $in: user.decks } }, function(err, userDecks) {
						if (err) return res.sendStatus(400);
						// return all the decks of the user
						return res.status(200).json({ decks: userDecks });
					});
				});
			});
		}
	});
});
// route to save a deck (add/remove card(s))
apiRoutes.post('/saveDeck', function(req, res) {
	// One of the fields is empty
	if (req.body.deck == undefined || req.body.deck._id == undefined)
		return res.sendStatus(400);

	// find the deck
	Deck.findOne({ _id: req.body.deck._id }, function(err, deck) {
    	if (err) return res.sendStatus(400);
    	// Deck not found
		if (!deck)
			return res.sendStatus(400);
		// Deck found
		else {
			deck.cards = req.body.deck.cards;
			deck.save(function(err) {
				if (err) return res.sendStatus(400);
				// Deck successfully updated
				res.sendStatus(200);
			});
		}
	});
});



// ----------------------------------
// Deckstore
// ----------------------------------
//
// route to put a deck on the store
apiRoutes.post('/putDeckOnStore', function(req, res) {
	// One of the fields is empty
	if (req.decoded == undefined || req.decoded.email == undefined || req.decoded.email.length <= 0 ||
		req.body.infos == undefined || req.body.infos._id == undefined)
		return res.sendStatus(400);
	// find the user
	User.findOne({ email: req.decoded.email.toLowerCase() }, function(err, user) {
    	if (err) return res.sendStatus(400);
    	// User not found
		if (!user)
			return res.sendStatus(400);
		// User found
		else {
			// find the deck
			Deck.findOne({ _id: req.body.infos._id }, function(err, deck) {
				if (err) return res.sendStatus(400);
				// Deck not found
				if (!deck)
					return res.sendStatus(400);
				// Deck found
				else {
					if (deck.cards.length <= 0)
						return res.sendStatus(400);
					deck.isOnline = true;
					deck.save(function(err) {
						if (err) return res.sendStatus(400);
						// Deck successfully updated, we can add the element to the store
						// Create the new store element
						var newStoreElement = new Store({
							deckId: deck._id,
							deck: { name: deck.name, tags: deck.tags, cards: deck.cards, createdTime: deck.createdTime },
							author: user._id });
						// Update the price or description if needed
						if (req.body.infos.description && req.body.infos.description.length > 0)
							newStoreElement.description = req.body.infos.description;
						if (req.body.infos.price && req.body.infos.price >= 0)
							newStoreElement.price = req.body.infos.price;
						// Save the element in database
						newStoreElement.save(function(err) {
							if (err) return res.sendStatus(400);
							// Element successfully created
							// Add the deck in the owned deck(s) list
							user.ownedDecks.push(newStoreElement._id);
							// Save the user in database
							user.save(function(err) {
								if (err) return res.sendStatus(400);
								// User successfully updated
								return res.status(200).json({ storeElement: newStoreElement });
							});
						});
					});
				}
			});
		}
	});
});
// route to remove a deck from the store
apiRoutes.post('/removeDeckFromStore', function(req, res) {
	// One of the fields is empty
	if (req.decoded == undefined || req.decoded.email == undefined || req.decoded.email.length <= 0 ||
		req.body.infos == undefined || req.body.infos._id == undefined)
		return res.sendStatus(400);
	// find the user
	User.findOne({ email: req.decoded.email.toLowerCase() }, function(err, user) {
    	if (err) return res.sendStatus(400);
    	// User not found
		if (!user)
			return res.sendStatus(400);
		// User found
		else {
			// Find the store element
			Store.findOne({ deckId: req.body.infos._id, isOnline: true }, function(err, storeElement) {
				if (err) return res.sendStatus(400);
				// Make it not visible in the store anymore (but still accessible for people who bought it)
				storeElement.isOnline = false;
				storeElement.save(function(err) {
					if (err) return res.sendStatus(400);
					// find the deck
					Deck.findOne({ _id: req.body.infos._id }, function(err, deck) {
				    	if (err) return res.sendStatus(400);
				    	// Deck not found
						if (!deck)
							return res.sendStatus(400);
						// Deck found
						else {
							deck.isOnline = false;
							deck.save(function(err) {
								if (err) return res.sendStatus(400);
								// Deck successfully updated
								res.sendStatus(200);
							});
						}
					});
				});
			});
		}
	});
});


// route to get the new decks on the store
apiRoutes.post('/getNewStoreDecks', function(req, res) {
	// One of the fields is empty
	if (req.decoded == undefined || req.decoded.email == undefined || req.decoded.email.length <= 0)
		return res.sendStatus(400);

	// find the user
	User.findOne({ email: req.decoded.email.toLowerCase() }, function(err, user) {
    	if (err) return res.sendStatus(400);
    	// User not found
		if (!user)
			return res.sendStatus(400);
		// User found
		else {
			var query = Store.find({ isOnline: true }).sort({ dateOfSale: -1 }).limit(numberDecksPerPage);
			if (req.body.currentPage && req.body.currentPage >= 0)
				query = query.skip(req.body.currentPage * numberDecksPerPage);
			query.populate('author').exec(function(err, decks) {
				if (err) return res.sendStatus(400);
				return res.status(200).json({ decks: decks });
			});
		}
	});
});
// route to get the popular decks on the store
apiRoutes.post('/getPopularStoreDecks', function(req, res) {
	// One of the fields is empty
	if (req.decoded == undefined || req.decoded.email == undefined || req.decoded.email.length <= 0)
		return res.sendStatus(400);

	// find the user
	User.findOne({ email: req.decoded.email.toLowerCase() }, function(err, user) {
    	if (err) return res.sendStatus(400);
    	// User not found
		if (!user)
			return res.sendStatus(400);
		// User found
		else {
			var query = Store.find({ isOnline: true }).sort({ nbDownloads: -1 }).limit(numberDecksPerPage);
			if (req.body.currentPage && req.body.currentPage >= 0)
				query = query.skip(req.body.currentPage * numberDecksPerPage);
			query.populate('author').exec(function(err, decks) {
				if (err) return res.sendStatus(400);
				return res.status(200).json({ decks: decks });
			});
		}
	});
});
// route to get the user's decks on the store
apiRoutes.post('/getUserStoreDecks', function(req, res) {
	// One of the fields is empty
	if (req.decoded == undefined || req.decoded.email == undefined || req.decoded.email.length <= 0)
		return res.sendStatus(400);

	// find the user
	User.findOne({ email: req.decoded.email.toLowerCase() }, function(err, user) {
    	if (err) return res.sendStatus(400);
    	// User not found
		if (!user)
			return res.sendStatus(400);
		// User found
		else {
			var query = Store.find({ author: user._id, isOnline: true }).sort({ dateOfSale: -1 }).limit(numberDecksPerPage);
			if (req.body.currentPage && req.body.currentPage >= 0)
				query = query.skip(req.body.currentPage * numberDecksPerPage);
			query.populate('author').exec(function(err, decks) {
				if (err) return res.sendStatus(400);
				return res.status(200).json({ decks: decks });
			});
		}
	});
});



// ----------------------------------
// Get tags
// ----------------------------------
// 
// route to get all the tags
apiRoutes.get('/getTags', function(req, res) {
	Tag.find({}, function(err, tags) {
		return res.status(200).json({ tags: tags });
	});
});



// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// =======================
// Start the server ======
// =======================
app.listen(port);
console.log("Running at Port " + port + " ...");