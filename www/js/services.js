angular.module('services', [])

// This factory check the http response, and redirect if needed
.factory('responseObserver', function responseObserver($q, $window) {
    return {
        responseError: function(errorResponse) {
            switch (errorResponse.status) {
	            case 403:
	                $window.location = '/#/login';
	                break;
            }
            return $q.reject(errorResponse);
        }
    };
})

// This factory is used to read and write in the offline data file
.factory('FileService', function($cordovaFile, offlineDataFile) {

	// Contains the file content
	var data = null;

	return {
		// Write in the file the content of 'data' variable
		writeData: function(newData) {
			if (typeof cordova == "undefined")
				return;
			$cordovaFile.writeFile(cordova.file.dataDirectory, offlineDataFile, JSON.stringify(newData), true).then(function (result) {
				// Success
				data = newData;
			}, function (error) {
				// Error
			});
		},
		// Returns the file content
		getData: function() {
			return data;
		},
		// Reset the data
		resetData: function() {
			data = null;
		},
		// Read in the file to get the content
		getDataInFile: function(doneFct) {
			if (typeof cordova == "undefined") {
				doneFct();
				return;
			}
			$cordovaFile.readAsText(cordova.file.dataDirectory, offlineDataFile).then(function (result) {
				// Success
				data = JSON.parse(result);
				doneFct();
			}, function (error) {
				// Error
				doneFct();
			});
		}
	};
})

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
.factory('TagService', function($http, server, UserService) {
	// Get all the tags from our database
	var tags = [];

	return {
		getAllTags: function() {
			if (UserService.getOfflineMode() == true)
				return;
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
.factory('UserService', function($http, $sanitize, server) {

	// Our user variable
	var user = {};
	// Offline mode
	var offlineMode = false;

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
		// Change the offline mode
		setOfflineMode: function(val) {
			offlineMode = val;
		},
		// Returns if the user is in offline mode
		getOfflineMode: function() {
			return offlineMode;
		},
		// Try to connect the user, and returns a token if successfully
		connect: function(curUser, successFct, errorFct) {
			offlineMode = false;
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
		// Try to connect the user with Facebook, and returns a token if successfully
		connectSocialMedia: function(curUser, successFct, errorFct) {
			offlineMode = false;
			// To avoid script injection (remove dangerous html)
			curUser.email = $sanitize(curUser.email);
			curUser.name = $sanitize(curUser.name);
			curUser.id = $sanitize(curUser.id);
			curUser.socialMedia = $sanitize(curUser.socialMedia);
			// Request the server to try to connect the user
			$http.post(server.url + ":" + server.port + '/connectSocialMedia', curUser).then(
				function(response) {
					// Success
					if (response.data != undefined) {
						// Get the user's informations
						user = response.data;
						// All the next http requests will have the token in the header
						$http.defaults.headers.common['authorization'] = user.token;
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
			if (typeof facebookConnectPlugin !== 'undefined' && offlineMode == false)
				facebookConnectPlugin.logout(function(){}, function(){});
			offlineMode = false;
		}
	};
})

// This factory is used to manage the decks
.factory('DeckService', function($http, $rootScope, $q, server, UserService, FileService) {

	var decks = [];
	var ownedDecks = [];
	var nbDecksSold = 0;
	var nbDecksOnSale = 0;

	return {
		// Create an empty deck
		newDeck: function() {
			return { name: '', tags: [], cards: [] };
		},
		newCard: function() {
			return { type: 1, question: '', answer: '', tags: [], seen: false };
		},
		// Add the deck in the owned list
		addOwnedDeck: function(storeElement) {
			ownedDecks.push(storeElement);
		},
		// Returns the number of decks the user has
		getNbDecks: function() {
			if (decks && decks.length)
				return decks.length;
			else
				return 0;
		},
		// Returns how many decks are currently available on the store
		getNbDecksOnSale: function() {
			return nbDecksOnSale;
		},
		// Returns how many decks we sold
		getNbDecksSold: function() {
			return nbDecksSold;
		},
		// Returns an object with the number of decks on the store, and how many downloads in total
		getInformationsDecks: function(successFct, errorFct) {
			// Reset the variables
			nbDecksSold = 0;
			nbDecksOnSale = 0;
			// Request informations to the server
			$http.get(server.url + ":" + server.port + '/api/getUserInfos').then(
				function(response) {
					// Success
					if (response.data.nbDecksSold)
						nbDecksSold = response.data.nbDecksSold;
					if (response.data.nbDecksOnSale)
						nbDecksOnSale = response.data.nbDecksOnSale;
					successFct();
				}, function(response) {
					// Fail
					errorFct();
				}
			);
		},
		// Update the decks variable from the database
		getDecksDatabase: function(doneFct) {
			// Reset the decks variable
			decks = [];
			ownedDecks = [];
			if (UserService.getOfflineMode() == true) {
				FileService.getDataInFile(function() {
					// Done
					var res = FileService.getData();
					if (res && res.decks)
						decks = res.decks;
					doneFct();
				});
			} else {
				// Request the server to get all the user's deck(s)
				$http.get(server.url + ":" + server.port + '/api/getDecks').then(
					function(response) {
						// Success
						if (response.data.decks)
							decks = response.data.decks;
						if (response.data.ownedDecks)
							ownedDecks = response.data.ownedDecks;
						doneFct();
					}, function(response) {
						// Fail
						doneFct();
					}
				);
			}
		},
		// Returns all the decks
		getDecks: function() {
			return decks;
		},
		// Returns all the owned decks
		getOwnedDecks: function() {
			return ownedDecks;
		},
		// Returns all the owned decks except mine
		getNotMineOwnedDecks: function() {
			return _.reject(ownedDecks, function(deck) { return deck.authorName == UserService.getUsername(); });
		},
		buyDeck: function(storeElement, successFct, errorFct) {
			// Request the server to add a new deck
			$http.post(server.url + ":" + server.port + '/api/buyDeck', { storeElement: storeElement }).then(
				function(response) {
					// Success
					ownedDecks.push(storeElement);
					successFct();
				}, function(response) {
					// Fail
					errorFct();
				}
			);
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
			// Search the deck in our deck list
			angular.forEach(decks, function(curDeck) {
				// We found the good deck to modify
				if (curDeck._id == id) {
					myDeck = curDeck;
					return;
				}
			});
			// Search the deck in our owned deck list
			angular.forEach(ownedDecks, function(storeElement) {
				// We found the good deck to modify
				if (storeElement.deck._id == id) {
					myDeck = storeElement.deck;
					return;
				}
			});
			return myDeck;
		},
		// Add a new deck, and returns the deck with his ID field filled
		addDeck: function(email, deck) {
			// Used to notify the controller we are done
			$rootScope.createDeck = $q.defer();
			// If we are in offline mode
			if (UserService.getOfflineMode() == true) {
				// Generate a unique ID
				deck._id = Math.floor(Date.now() / 1000);
				deck.createdTime = Date.now();
				deck.isOnline = false;
				decks.push(deck);
				FileService.writeData({ decks: decks });
				$rootScope.createDeck.resolve();
			} else {
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
			}
			return deck;
		},
		// Remove a deck
		removeDeck: function(deck, successFct, errorFct) {
			if (deck == null) {
				errorFct();
				return;
			}
			// If we are in offline mode
			if (UserService.getOfflineMode() == true) {
				decks = _.reject(decks, function(curDeck) { return curDeck._id == deck._id; });
				FileService.writeData({ decks: decks });
				successFct();
			}
			else {
				// Request the server to delete the deck
				$http.post(server.url + ":" + server.port + '/api/deleteDeck', { deck: deck }).then(
					function(response) {
						// Success
						decks = response.data.decks;
						successFct();
					}, function(response) {
						// Fail
						errorFct();
					}
				);
			}
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
				// If the user is in offline mode
				if (UserService.getOfflineMode() == true) {
					FileService.writeData({ decks: decks });
				} else {
					$http.post(server.url + ":" + server.port + '/api/saveDeck', { deck: curDeck }).then(
						function(response) {}, function(response) {
							// Fail
							// Remove the card, since we could not add it
							curDeck = _.reject(curDeck.cards, function(curCard) { return curCard.question.toLowerCase() == card.question.toLowerCase(); });
						}
					);
				}
			}
			return curDeck;
		},
		// Remove a card from a deck
		removeCard: function(card, deck, successFct, errorFct) {
			if (card == null || deck == null)
				return;
			deck.cards = _.reject(deck.cards, function(curCard) { return curCard.question.toLowerCase() == card.question.toLowerCase(); });
			// If the user is in offline mode
			if (UserService.getOfflineMode() == true) {
				FileService.writeData({ decks: decks });
				successFct();
			} else {
				$http.post(server.url + ":" + server.port + '/api/saveDeck', { deck: deck }).then(
					function(response) {
						// Success
						successFct();
					}, function(response) {
						// Fail
						// Add the card, since we could not remove it
						deck.cards.push(card);
						errorFct();
					}
				);
			}
		},
		// Function to reset all the variables of this service
		reset: function() {
			decks = [];
			ownedDecks = [];
			nbDecksSold = 0;
			nbDecksOnSale = 0;
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
})

// This factory is used to manage the decks
.factory('StoreService', function($http, $translate, server, DeckService) {

	// Variable used to display the sell/remove buttons
	var isWorking = false;

	// Search decks
	var searchDecks = { decks: [], page: 0, endOfContent: false, isWorking: false, request: "getSearchStoreDecks", search: null };
	// New decks
	var newDecks = { decks: [], page: 0, endOfContent: false, isWorking: false, request: "getNewStoreDecks" };
	// Popular decks
	var popularDecks = { decks: [], page: 0, endOfContent: false, isWorking: false, request: "getPopularStoreDecks" };
	// User's decks
	var userDecks = { decks: [], page: 0, endOfContent: false, isWorking: false, request: "getUserStoreDecks" };

	// This function add all the decks in the list
	addDecksToList = function(list, newDecks) {
		// Get all the owned decks
		var ownedDecks = DeckService.getOwnedDecks();
		list.endOfContent = true;
		angular.forEach(newDecks, function(newDeck) {
			list.endOfContent = false;
			// Check if we own this deck, if so we set a field isOwned
			angular.forEach(ownedDecks, function(ownedDeck) {
				if (ownedDeck.deckId == newDeck.deckId)
					newDeck.isOwned = true;
			});
			list.decks.push(newDeck);
		});
	};

	// Go through all the lists, and set the deck as owned
	setDeckOwned = function(decks, storeElement) {
		angular.forEach(decks, function(curStoreElement) {
			if (curStoreElement._id == storeElement._id) {
				curStoreElement.isOwned = true;
				return;
			}
		});
	};

	// Get the next page for the list in parameter
	getNextPage = function(list, successFct, errorFct) {
		// If we know there are no content anymore or the service is already requesting the server, return directly
		if (list.endOfContent == true || list.isWorking == true) {
			successFct();
			return;
		}
		list.isWorking = true;
		$http.post(server.url + ":" + server.port + '/api/' + list.request, { currentPage: list.page, search: list.search }).then(
			function(response) {
				// Success
				if (response.data.decks)
					addDecksToList(list, response.data.decks);
				list.page += 1;
				list.isWorking = false;
				successFct();
			}, function(response) {
				// Fail
				list.isWorking = false;
				errorFct();
			}
		);
	};

	return {
		// Return true if the service is working with the server, else return false
		isWorking: function() {
			return isWorking;
		},

		// Function used when a user buy a deck, we set the deck as owned
		setElementOwned: function(storeElement) {
			setDeckOwned(newDecks.decks, storeElement);
			setDeckOwned(popularDecks.decks, storeElement);
			setDeckOwned(userDecks.decks, storeElement);
		},

		// Used for the first time we arrive in the deckstore
		// for each list, we check if we have at least the first page
		getFirstPage: function() {
			if (newDecks.page == 0)
				getNextPage(newDecks, function(){}, function(){});
			if (popularDecks.page == 0)
				getNextPage(popularDecks, function(){}, function(){});
			if (userDecks.page == 0)
				getNextPage(userDecks, function(){}, function(){});
		},

		// Used to set the new search for the next query
		setSearch: function(val) {
			searchDecks.search = val;
		},

		// Search
		search: {
			// Return all the decks based on the search word
			getDecks: function() {
				return searchDecks.decks;
			},
			// Return the title for this category
			getTitle: function() {
				return $translate.instant('DECKSTORE.Search');
			},
			// Update the searchDecks variable with the decks found with the search word
			getNextPage: function(successFct, errorFct) {
				if (searchDecks.search && searchDecks.search.length > 0)
					getNextPage(searchDecks, successFct, errorFct);
			}
		},

		// New decks
		newDecks: {
			// Return all the first most recent decks
			getDecks: function() {
				return newDecks.decks;
			},
			// Return the title for this category
			getTitle: function() {
				return $translate.instant('DECKSTORE.New-decks');
			},
			// Update the newDecks variable with the most recent decks on the store
			getNextPage: function(successFct, errorFct) {
				getNextPage(newDecks, successFct, errorFct);
			}
		},

		// Popular decks
		popularDecks: {
			// Return all the first most downloaded decks
			getDecks: function() {
				return popularDecks.decks;
			},
			// Return the title for this category
			getTitle: function() {
				return $translate.instant('DECKSTORE.Popular-decks');
			},
			// Update the popularDecks variable with the most recent decks on the store
			getNextPage: function(successFct, errorFct) {
				getNextPage(popularDecks, successFct, errorFct);
			}
		},

		// User's decks
		userDecks: {
			// Return all the decks for the current user
			getDecks: function() {
				return userDecks.decks;
			},
			// Return the title for this category
			getTitle: function() {
				return $translate.instant('MYDECKS.My-decks');
			},
			// Update the userDecks variable with the user's decks on the store
			getNextPage: function(successFct, errorFct) {
				getNextPage(userDecks, successFct, errorFct);
			}
		},

		// Add a deck on the store
		addDeckOnStore: function(deckId, description, price, successFct, errorFct) {
			isWorking = true;
			$http.post(server.url + ":" + server.port + '/api/putDeckOnStore', { infos: { _id: deckId, description: description, price: price } }).then(
				function(response) {
					// Success
					if (response.data.storeElement)
						DeckService.addOwnedDeck(response.data.storeElement);
					isWorking = false;
					successFct();
				}, function(response) {
					// Fail
					isWorking = false;
					errorFct();
				}
			);
		},
		// Remove a deck from the store
		removeDeckFromStore: function(deckId, successFct, errorFct) {
			isWorking = true;
			$http.post(server.url + ":" + server.port + '/api/removeDeckFromStore', { infos: { _id: deckId } }).then(
				function(response) {
					// Success
					isWorking = false;
					successFct();
				}, function(response) {
					// Fail
					isWorking = false;
					errorFct();
				}
			);
		},
		// Function to reset all the variables of this service
		reset: function() {
			searchDecks = { decks: [], page: 0, endOfContent: false, isWorking: false, request: "getSearchStoreDecks", search: null };
			newDecks = { decks: [], page: 0, endOfContent: false, isWorking: false, request: "getNewStoreDecks" };
			popularDecks = { decks: [], page: 0, endOfContent: false, isWorking: false, request: "getPopularStoreDecks" };
			userDecks = { decks: [], page: 0, endOfContent: false, isWorking: false, request: "getUserStoreDecks" };
		}
	};
});