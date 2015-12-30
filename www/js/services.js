angular.module('services', [])

// This factory is used to display popups
.factory('PopupService', function($ionicPopup, $translate) {
	return {
		// Display a 'OK' popup with the title and message passed in parameters
		showAlert: function(title, message) {
			var alertPopup = $ionicPopup.alert({
				title: title,
				template: message
			});
		},
		// Display a "Yes/No" popup and run the good function depending of the user's response
		showConfirm: function(title, message, noFct, yesFct) {
			var confirmPopup = $ionicPopup.confirm({
				title: title,
				template: message,
				cancelText: $translate.instant('UTILS.No'),
				okText: $translate.instant('UTILS.Yes')
			});

			// If the user pressed Yes, we run the yesFct()
			// else we run the noFct()
			confirmPopup.then(function(res) {
				if (res)
					yesFct();
				else
					noFct();
			});
		}
	};
})

// This factory is used to manage the tags for a deck or a card
.factory('TagService', function($http, server) {
	// Get all the tags from our database
	var tags = [];

	return {
		getAllTags: function() {
			// Request the server to get all the tags
			$http.get(server.url + ":" + server.port + '/api/getTags').then(
				function(response) {
					// Success
					if (response.data.tags != undefined)
						tags = response.data.tags;
				}, function(response) {
					// Fail
				}
			);
		},
		getTags: function() {
			return tags;
		},
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
				if (currentTag.name.toLowerCase().indexOf(searchStr.toLowerCase()) > -1)
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
				if (tag.name.toLowerCase() == cur.name.toLowerCase()) {
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
			tagsContainer.tags = _.reject(tagsContainer.tags, function(curTag) { return curTag._id == tag._id; });
			// If we have removed the tag, check if we should add it to the autocomplete results
			if (lengthBefore != tagsContainer.tags.length && search.value.length > 0 && tag.name.toLowerCase().indexOf(search.value.toLowerCase()) > -1)
				search.foundTags.push(tag);
		}
	};
})

// This factory is used to manage the users
.factory('UserService', function($http, $sanitize, server, DeckService, TagService) {

	// Our user variable
	var user = {};

	return {
		// Return the current username
		getUsername: function() {
			return user.name;
		},
		// Return the current email
		getEmail: function() {
			return user.email;
		},
		// Return the current user's token
		getToken: function() {
			return user.token;
		},
		// Try to create a new user if the email is not already used
		createAccount: function(newUser, successFct, errorFct) {
			// To avoid script injection (remove dangerous html)
			newUser.username = $sanitize(newUser.username);
			newUser.password = $sanitize(newUser.password);
			// Request the server to try to add the user
			$http.post(server.url + ":" + server.port + '/createAccount', newUser).then(
				function(response) {
					// Success
					successFct(response);
				}, function(response) {
					// Fail
					errorFct(response);
				}
			);
		},
		// Try to connect the user, and returns a token if successfully
		connect: function(curUser, successFct, errorFct) {
			// To avoid script injection (remove dangerous html)
			curUser.email = $sanitize(curUser.email);
			curUser.password = $sanitize(curUser.password);
			// Request the server to try to connect the user
			$http.post(server.url + ":" + server.port + '/connect', curUser).then(
				function(response) {
					// Success
					if (response.data != undefined) {
						// Get the user's informations
						user = response.data;
						// All the next http requests will have the token in the header
						$http.defaults.headers.common['authorization'] = user.token;
						// Get the user's decks
						DeckService.getDecksDatabase();
						// Get the tags
						TagService.getAllTags();
						successFct(response);
					}
					else
						errorFct(response);
				}, function(response) {
					// Fail
					errorFct(response);
				}
			);
		},
		// Disconnect the user
		disconnect: function() {
			user = {};
		}
	};
})

// This factory is used to manage the decks
.factory('DeckService', function($http, $rootScope, $q, server) {

	var decks = {};

	return {
		// Create an empty deck
		newDeck: function() {
			return { name: '', tags: [], cards: [] };
		},
		newCard: function() {
			return { type: 1, question: '', answer: '', tags: [], seen: false };
		},
		// Update the decks variable from the database
		getDecksDatabase: function() {
			// Used to notify the controller we are done
			$rootScope.getDecks = $q.defer();
			// Reset the decks variable
			decks = {};
			// Request the server to get all the user's deck(s)
			$http.get(server.url + ":" + server.port + '/api/getDecks').then(
				function(response) {
					// Success
					decks = response.data.decks;
					$rootScope.getDecks.resolve();
				}, function(response) {
					// Fail
					$rootScope.getDecks.resolve();
				}
			);
		},
		// Returns all the decks
		getDecks: function() {
			return decks;
		},
		// Returns the number of unseen cards
		getNbUnseenCards: function(deck) {
			var nb = 0;
			if (deck == null)
				return nb;
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
				if (curDeck._id == id) {
					myDeck = curDeck;
					return;
				}
			});
			return myDeck;
		},
		// Add a new deck, and returns the deck with his ID field filled
		addDeck: function(email, deck) {
			// Used to notify the controller we are done
			$rootScope.createDeck = $q.defer();
			// Request the server to add a new deck
			$http.post(server.url + ":" + server.port + '/api/addDeck', { deck: deck }).then(
				function(response) {
					// Success
					deck._id = response.data.deck._id;
					decks.push(response.data.deck);
					$rootScope.createDeck.resolve();
				}, function(response) {
					// Fail
					$rootScope.createDeck.resolve();
				}
			);
			return deck;
		},
		// Remove a deck
		removeDeck: function(deck) {
			if (deck == null)
				return;
			// Request the server to delete the deck
			$http.post(server.url + ":" + server.port + '/api/deleteDeck', { deck: deck }).then(
				function(response) {
					// Success
					decks = response.data.decks;
				}, function(response) {}
			);
		},
		// Add this card in the deck, and returns the deck up to date
		addCard: function(card, curDeck) {
			if (card == null || curDeck == null)
				return;
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
				curDeck.cards.push(card);
				$http.post(server.url + ":" + server.port + '/api/addCard', { deck: curDeck }).then(
					function(response) {}, function(response) {
						// Fail
						// Remove the card, since we could not add it
						curDeck = _.reject(curDeck.cards, function(curCard) { return curCard.question.toLowerCase() == card.question.toLowerCase(); });
					}
				);
			}
			return curDeck;
		},
		// Remove a card from a deck
		removeCard: function(card, deck) {
			if (card == null || deck == null)
				return;
			deck.cards = _.reject(deck.cards, function(curCard) { return curCard._id == card._id; });
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
			if (curCard.question == card.question) {
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
			if (deck == null)
				return null;
			var newCardIndex = -1;
			// If we are in study mode, or it is the first card
			if (studyMode || card == null) {
				newCardIndex = _.random(deck.cards.length - 1);
				// If we randomly found the same card, return the next one
				if (card != null && card.question && deck.cards[newCardIndex].question == card.question)
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