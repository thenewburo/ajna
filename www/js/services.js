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
		// Return a new search object
		newSearch: function() {
			return { value: "", foundTags: [] };
		},
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
	var fakeID = 42;
	// Get all the decks from our database
	var decks = [
	{
		id: 0,
		name: 'First deck example',
		image: '',
		tags: [],
		isFavorite: false,
		cards: [
			{ id: 1, type: 1, question: 'Question 1', answer: '2015', frequency: 1, tags: [], seen: false },
			{ id: 2, type: 1, question: 'Question 2', answer: '2015', frequency: 1, tags: [], seen: false },
			{ id: 3, type: 1, question: 'Question 3', answer: '2015', frequency: 1, tags: [], seen: false },
			{ id: 4, type: 1, question: 'Question 4', answer: '2015', frequency: 1, tags: [], seen: false },
			{ id: 5, type: 1, question: 'Question 5', answer: '2015', frequency: 1, tags: [], seen: false },
			{ id: 6, type: 1, question: 'Question 6', answer: '2015', frequency: 1, tags: [], seen: false },
			{ id: 7, type: 1, question: 'Question 7', answer: '2015', frequency: 1, tags: [], seen: false },
			{ id: 8, type: 1, question: 'Question 8', answer: '2015', frequency: 1, tags: [], seen: false },
			{ id: 9, type: 1, question: 'Question 9', answer: '2015', frequency: 1, tags: [], seen: false },
			{ id: 10, type: 1, question: 'Question 10', answer: '2015', frequency: 1, tags: [], seen: false }
		]
	},
	{
		id: 11,
		name: 'Second deck example',
		image: '',
		tags: [],
		isFavorite: false,
		cards: [
			{ id: 12, type: 1, question: 'What year are we in?', answer: '2015', frequency: 1, tags: [], seen: false },
			{ id: 13, type: 1, question: 'What year are we in?What year are we in?', answer: '2015', frequency: 1, tags: [], seen: false },
			{ id: 14, type: 2, question: 'What year are we in? We are in year [..]', answer: 'What year are we in? We are in year 2015', frequency: 1, tags: [], seen: false }
		]
	}];

	return {
		// Create an empty deck
		newDeck: function() {
			return { name: '', image: '', tags: [], isFavorite: false, cards: [] };
		},
		newCard: function() {
			return { type: 1, question: '', answer: '', frequency: 1, tags: [], seen: false };
		},
		// Returns all the decks
		getDecks: function() {
			return decks;
		},
		// Returns the number of unseen cards
		getNbUnseenCards: function(deck) {
			var nb = 0;
			angular.forEach (deck.cards, function(card) {
				if (card.seen == false)
					nb++;
			});
			return nb;
		},
		// Return the deck with the ID passed in parameter, null if not found
		getDeckWithId: function(id) {
			var myDeck = null;
			if (id == undefined)
				return null;
			// Find the deck in our deck list
			angular.forEach(decks, function(curDeck) {
				// We found the good deck to modify
				if (curDeck.id == id) {
					myDeck = curDeck;
					return;
				}
			});
			return myDeck;
		},
		// Add a new deck, and returns the deck with his ID field filled
		addDeck: function(deck) {
			deck.id = fakeID++;
			decks.push(deck);
			return deck;
		},
		// Remove a deck
		removeDeck: function(deck) {
			decks = _.reject(decks, function(curDeck) { return curDeck.id == deck.id; });
		},
		// Add this card in the deck, and returns the deck up to date
		addCard: function(card, deck) {
			var myDeck = deck;
			// Find the deck in our deck list
			angular.forEach(decks, function(curDeck) {
				// We found the good deck to modify
				if (curDeck.id == deck.id) {
					// Check the card is not already in the deck (same question)
					var alreadyIn = false;
					angular.forEach(curDeck.cards, function(curCard) {
						if (curCard.question.toLowerCase() == card.question.toLowerCase()) {
							alreadyIn = true;
							return;
						}
					});
					// If not, push it in the deck and in our deck object to update the view
					if (alreadyIn == false) {
						card.id = fakeID++;
						curDeck.cards.push(card);
					}
					myDeck = curDeck;
				}
			});
			return myDeck;
		}
	};
})

// This factory is used to manage the decks
.factory('CardService', function() {
	// List of the type of card we can use
	var cardTypes = [{ id: 1, value: 'Question' }, { id: 2, value: 'Fill in the blank' }];
	// A stack to store all the cards index we saw (needed by the 'Previous card' option)
	var cardsIndexStack = [];

	// Returns the index of the card in this deck
	getCardIndex = function(card, deck) {
		var res = -1;
		angular.forEach(deck.cards, function(curCard, index) {
			if (curCard.id == card.id) {
				res = index;
				return;
			}
		});
		return res;
	};

	// Returns the next card
	getNextCardWithIndex = function(cardId, deck) {
		// We want the card next to the current one
		var res = cardId + 1;
		// If we were on the last of the array, go back to the first
		if (res >= deck.cards.length)
			res = 0;
		return res;
	};

	return {
		// Add an index in the stack (/!\you should not use this function /!\)
		addIndexInStack: function(index) {
			cardsIndexStack.push(index);
		},
		// Return the list of type we can set for a card
		getCardTypes: function() {
			return cardTypes;
		},
		// Return the next card by using the current card, the deck and the study mode
		getNextCard: function(card, deck, studyMode) {
			var newCardIndex = -1;
			// If we are in study mode, or it is the first card
			if (studyMode || card == null) {
				newCardIndex = _.random(deck.cards.length - 1);
				// If we randomly found the same card, return the next one
				if (card != null && card.id && deck.cards[newCardIndex].id == card.id)
					newCardIndex = getNextCardWithIndex(newCardIndex, deck);
			}
			// We just take the next card
			else {
				// Find the index of the current card
				var currentIndex = getCardIndex(card, deck);
				// If not found, return the current card
				if (currentIndex == -1)
					return card;
				newCardIndex = getNextCardWithIndex(currentIndex, deck);
			}
			cardsIndexStack.push(newCardIndex);
			return deck.cards[newCardIndex];
		},
		// Return the last card we saw by using our cards ID stack
		getPreviousCard: function(deck) {
			cardsIndexStack = _.initial(cardsIndexStack);
			return deck.cards[_.last(cardsIndexStack)];
		}
	};
});