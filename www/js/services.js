angular.module('services', [])

// This factory is used to display popups
.factory('PopupService', function($ionicPopup) {
	return {
		// Display a 'OK' popup with the title and message passed in parameters
		showAlert: function(title, message) {
			var alertPopup = $ionicPopup.alert({
				title: title,
				template: message
			});
		}
	};
})

// This factory is used to manage the users
.factory('UserService', function() {
	var user = {};
	var isConnected = false;
	// Simulate our database
	var users = [{ username: "root", email: "root@root.com", password: "root" }];

	return {
		// Return the current username
		getUsername: function() {
			return user.username;
		},
		// Return the current email
		getEmail: function() {
			return user.email;
		},
		// Return true if the user is connected, else false
		isUserConnected: function() {
			return isConnected;
		},
		// Try to create a new user if the email is not already used
		createAccount: function(name, mail, pass) {
			var alreadyUsed = false;
			angular.forEach(users, function(cur) {
				if (cur.mail == mail) {
					alreadyUsed = true;
					return;
				}
			});
			if (alreadyUsed)
				return false;
			users.push({ username: name, email: mail, password: pass});
			user = { username: name, email: mail };
			return true;
		},
		// Look in our database if the user exists
		connect: function(name, pass) {
			if (isConnected)
				return isConnected;
			angular.forEach(users, function(cur) {
				if (cur.username == name && cur.password == pass)
				{
					user = { username: cur.username, email: cur.email };
					isConnected = true;
					return;
				}
			});
			return isConnected;
		},
		// Disconnect the user
		disconnect: function() {
			user = {};
		}
	};
})

// This factory is used to manage the tags for a deck or a card
.factory('TagService', function() {
	// Get all the tags from our database
	var tags = ["Math", "French", "English", "American", "History", "Geography", "Biology"];

	return {
		// This function returns all the tags that match with the string passed in parameter
		// but ignore all the tags which are in the array passed in parameter
		searchTags: function(searchStr, ignoreArray) {
			var res = [];
			if (searchStr == undefined || searchStr.length <= 0)
				return res;
			angular.forEach(tags, function(currentTag) {
				// If we found a tag that match with the search string, we push it in the res array
				if (currentTag.toLowerCase().indexOf(searchStr.toLowerCase()) > -1)
					res.push(currentTag);
			});
			// We want to remove all the tag(s) that are in the 'res' and in the 'ignoreArray'
			res = _.difference(res, ignoreArray);
			return res;
		},
		// Add the tag in the tags array, and clear the search object
		addTag: function(tag, tagsContainer, search) {
			// We check the tag is not already in our list
			var alreadyIn = false;
			angular.forEach(tagsContainer.tags, function(cur) {
				if (tag.toLowerCase() == cur.toLowerCase()) {
					alreadyIn = true;
					return;
				}
			});
			// if not, we push it to the tagsContainer list
			if (alreadyIn == false) {
				tagsContainer.tags.push(tag);
				search.value = "";
				search.foundTags = [];
			}
		},
		// Remove a tag from our tags array, then check if we have to put it in the search object
		removeTag: function(tag, tagsContainer, search) {
			// Save the length to check if we have removed an item
			var lengthBefore = tagsContainer.tags.length;
			// We remove the tag from our list
			tagsContainer.tags = _.reject(tagsContainer.tags, function(curTag) { return curTag == tag; });
			// If we have removed the tag, check if we should add it to the autocomplete results
			if (lengthBefore != tagsContainer.tags.length && search.value.length > 0 && tag.toLowerCase().indexOf(search.value.toLowerCase()) > -1)
				search.foundTags.push(tag);
		}
	};
})

// This factory is used to manage the decks
.factory('DeckService', function() {
	// Temp variable to simulate the ID incremented by the database
	var fakeID = 5;
	// Get all the decks from our database
	var decks = [
	{
		id: 0,
		name: 'First deck example',
		image: '',
		tags: [],
		isFavorite: false,
		cards: [
			{
				id: 2,
				type: 'Question',
				question: 'What year are we in?',
				answer: '2015',
				frequency: 1,
				tags: [],
				seen: false
			},
			{
				id: 3,
				type: 'Question',
				question: 'What is the next year?',
				answer: '2016',
				frequency: 1,
				tags: [],
				seen: false
			}
		]
	},
	{
		id: 1,
		name: 'Second deck example',
		image: '',
		tags: [],
		isFavorite: true,
		cards: [
			{
				id: 4,
				type: 'Question',
				question: 'What year are we in?',
				answer: '2015',
				frequency: 1,
				tags: [],
				seen: false
			}
		]
	}];

	return {
		// Returns all the decks
		getDecks: function() {
			return decks;
		},
		// Add a new deck
		addDeck: function(deck) {
			deck.id = fakeID++;
			angular.forEach(deck.cards, function(c) {
				c.id = fakeID++;
			});
			decks.push(deck);
		},
		removeDeck: function(deck) {
			decks = _.reject(decks, function(curDeck) { return curDeck == deck; });
		}
	};
});