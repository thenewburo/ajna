angular.module('controllers', [])

.controller('OnBoardingCtrl', function($scope, $ionicHistory, $state, $ionicSlideBoxDelegate, UserService) {

	// Used to remove the slide bounce when on the first and last slide
	$scope.myActiveSlide = 0;

	// Swipe to the next page
	$scope.nextSlide = function() {
		$ionicSlideBoxDelegate.next();
	};

	// Redirect to the login page
	$scope.goToLoginPage = function() {
		// Make the next page the root history, so we can't use the back button to come back to the previous page
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.go("login");
	};

	// Used to remove the slide bounce when on the first and last slide
	$scope.enableSlide = function() {
		$ionicSlideBoxDelegate.enableSlide(true);
	};
	// Used to remove the slide bounce when on the first and last slide
	$scope.$watch(function(scope) { return scope.myActiveSlide },
		function(newValue, oldValue) {
			// Disable slide on the first and last slide
			if (newValue == 0 || newValue == 2)
				$ionicSlideBoxDelegate.enableSlide(false);
		}
	);
})

.controller('LoginCtrl', function($scope, $state, $translate, $ionicHistory, $ionicLoading, UserService, PopupService, DeckService, TagService) {

	// The user's login data
	$scope.loginData = {};

	// This function checks all the fields and returns 0 if everything is correct, else returns an error code
	checkLoginFields = function() {
		// One of the fields is empty
		if (!$scope.loginData.email || $scope.loginData.email.length <= 0 ||
			!$scope.loginData.password || $scope.loginData.password.length <= 0)
			return 1;
		return 0;
	};

	// Perform the login action when the user submits the login form
	$scope.login = function() {
		// Check all the fields, then use the return code to execute the good actions
		switch (checkLoginFields()) {

			// Everything is correct, we can try to connect but still check for an error
			case 0:
				// Display a loading screen
				$ionicLoading.show({ template: $translate.instant('LOGIN.Sign-in') + ' ...' });
				UserService.connect($scope.loginData, function(response) {
					// Success
					// Get the user's decks
					DeckService.getDecksDatabase();
					// Get the tags
					TagService.getAllTags();
					// Reset the fields
					$scope.loginData = {};
					// Make the next page the root history
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					// Hide the loading screen
					$ionicLoading.hide();
					// Redirect to 'My decks' page
					$state.go("menu.myDecks");
				}, function(response) {
					// Fail
					// Hide the loading screen
					$ionicLoading.hide();
					// Display a popup
					if (response.data != undefined && response.data.title != undefined && response.data.message != undefined)
						PopupService.showAlert($translate.instant(response.data.title), $translate.instant(response.data.message));
					else
						PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant('ERROR.Cannot-connect'));
				});
				break;

			// An error happened
			case 1:
				PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant('ERROR.Error-fields'));
				break;

			default:
		}
	};
})

.controller('NewAccountCtrl', function($scope, $state, $translate, $ionicLoading, UserService, PopupService) {
	
	// Variable to temporarily store the user's data
	$scope.accountData = {};

	// This function checks all the fields and returns 0 if everything is correct, else returns an error code
	checkAccoutFields = function() {
		// One of the fields is empty
		if (!$scope.accountData.username || $scope.accountData.username.length <= 0 ||
			!$scope.accountData.email || $scope.accountData.email.length <= 0 ||
			!$scope.accountData.password || $scope.accountData.password.length <= 0)
			return 1;

		// Email address is not well formated
		var patt = /\S+@\S+\.\S+/;
		if (patt.test($scope.accountData.email) == false)
			return 2;

		return 0;
	};

	// Create a new account
	$scope.createAccount = function() {
		// Check all the fields, then use the return code to execute the good actions
		switch (checkAccoutFields()) {

			// Everything is correct, we can try to create the account but still check if email address not already used
			case 0:
				// Display a loading screen
				$ionicLoading.show({ template: $translate.instant('NEWACCOUNT.Creating') + ' ...' });
				// Try to create an account
				UserService.createAccount($scope.accountData, function(response) {
					// Success
					$scope.accountData = {};
					// Hide the loading screen
					$ionicLoading.hide();
					// Redirect
					$state.go("login");
					PopupService.showAlert($translate.instant('NEWACCOUNT.New-account'), $translate.instant('NEWACCOUNT.Account-created'));
				}, function(response) {
					// Fail
					// Hide the loading screen
					$ionicLoading.hide();
					if (response.data != undefined && response.data.title != undefined && response.data.message != undefined)
						PopupService.showAlert($translate.instant(response.data.title), $translate.instant(response.data.message));
				});
				break;

			// One field is empty
			case 1:
				PopupService.showAlert($translate.instant('NEWACCOUNT.New-account'), $translate.instant('ERROR.Error-fields'));
				break;

			// Email address is not well formated
			case 2:
				PopupService.showAlert($translate.instant('NEWACCOUNT.New-account'), $translate.instant('ERROR.Email-incorrect'));
				break;

			default:
		}
	};
})

.controller('MenuCtrl', function($scope, $state, $ionicHistory, UserService) {

	$scope.getUsername = function() {
		return UserService.getUsername();
	};
	$scope.getEmail = function() {
		return UserService.getEmail();
	};

	// Redirect to "My decks" page
	$scope.goToMyDecks = function() {
		$state.go("menu.myDecks");
		$ionicHistory.nextViewOptions({
			historyRoot: true
		});
	};

	// Redirect to "Deckstore" page
	$scope.goToDeckstore = function() {
		$state.go("menu.deckstore");
	};

	// Redirect to "My account" page
	$scope.goToMyAccount = function() {
		$state.go("menu.myAccount");
	};

	// Disconnect the user
	$scope.logout = function() {
		UserService.disconnect();
		$state.go("login");
		$ionicHistory.nextViewOptions({
			historyRoot: true
		});
	};
})

.controller('MyAccountCtrl', function($scope, $state, $ionicHistory, UserService, DeckService) {
	
	DeckService.getInformationsDecks(function(){}, function() {
		// Fail
		$state.go("menu.myDecks");
		$ionicHistory.nextViewOptions({
			historyRoot: true
		});
	});

	$scope.getUsername = function() {
		return UserService.getUsername();
	};
	$scope.getEmail = function() {
		return UserService.getEmail();
	};

	$scope.getNbDecks = function() {
		return DeckService.getNbDecks();
	};
	$scope.getNbDecksSold = function() {
		return DeckService.getNbDecksSold();
	};
	$scope.getNbDecksOnSale = function() {
		return DeckService.getNbDecksOnSale();
	};

	// Disconnect the user
	$scope.logout = function() {
		UserService.disconnect();
		$state.go("login");
		$ionicHistory.nextViewOptions({
			historyRoot: true
		});
	};

	// Called when the user click the "connect with Paypal" button
	$scope.connectPaypal = function() {

	};
})

.controller('MyDecksCtrl', function($scope, $ionicPopover, $state, $ionicHistory, $translate, $ionicLoading, DeckService, TagService, PopupService) {
	// User's decks
	$scope.myDecks = [];
	DeckService.reset();
	DeckService.getDecksDatabase();
	// Get the tags
	TagService.getAllTags();
	// Variable to know which tab we are
	$scope.myDecksTabsActivated = true;

	// Get the number of unseen cards
	$scope.numberUnseenCards = function(deck) {
		return DeckService.getNbUnseenCards(deck);
	};

	// Get the user's deck(s)
	$scope.getDecks = function() {
		return DeckService.getDecks();
	};

	// Get the user's owned deck(s)
	$scope.getOwnedDecks = function() {
		return DeckService.getNotMineOwnedDecks();
	};

	// Redirect to display a deck
	$scope.displayDeck = function(deck, isBoughtDeck) {
		$state.go("menu.displayDeck", { deck: deck, isBoughtDeck: isBoughtDeck });
	};

	// Ask the user if he wants to delete the deck
	$scope.deleteDeck = function(deck) {
		PopupService.showConfirm($translate.instant('MYDECKS.Delete-deck'), $translate.instant('MYDECKS.Sure-delete-deck'),
			// If the user pressed No
			function() {},
			// If the user pressed Yes
			function() {
				if (deck.isOnline == true) {
					PopupService.showAlert($translate.instant('ERROR.Error'), $translate.instant('ERROR.Error-deck-online'));
					return;
				}
				// Display a loading screen
				$ionicLoading.show({ template: $translate.instant('UTILS.Wait') + ' ...' });
				DeckService.removeDeck(deck, function() {
					// Ask our deckService to get all the decks to refresh the list
					$scope.myDecks = DeckService.getDecks();
					// Hide the loading screen
					$ionicLoading.hide();
				}, function() {
					// Hide the loading screen
					$ionicLoading.hide();
				});
			}
		);
	};

	// Get the popover template
	$ionicPopover.fromTemplateUrl('myDecksPopover.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.popover = popover;
	});
	$scope.openPopover = function($event) {
		$scope.popover.show($event);
	};
	$scope.closePopover = function() {
		$scope.popover.hide();
	};
	//Cleanup the popover when we're done with it!
	$scope.$on('$destroy', function() {
		$scope.popover.remove();
	});
})

.controller('CreateDeckCtrl', function($scope, $state, $translate, PopupService, TagService, DeckService) {
	
	// Variable that contains our new deck informations
	$scope.currentDeck = DeckService.newDeck();
	// Variable used to display the tags results (autocomplete) and store the user input
	$scope.search = TagService.newSearch();

	$scope.searchForTags = function() {
		// We use our TagService to get all the tags that match with the search variable
		$scope.search.foundTags = TagService.searchTags($scope.search.value, $scope.currentDeck.tags);
	};

	// Add the tag in the deck list, and clear the search object
	$scope.addTag = function(tag) {
		TagService.addTag(tag, $scope.currentDeck, $scope.search);
	};

	// Remove the tag in the deck list
	$scope.removeTag = function(tag) {
		TagService.removeTag(tag, $scope.currentDeck, $scope.search);
	};

	// Move to the 'Create new card' page
	$scope.goToCreateCard = function() {
		// Check the user put at least a name for the deck
		if ($scope.currentDeck.name.length > 0) {
			// Redirect to the 'Create new card' page, and pass as parameter the new deck
			$state.go("menu.createCard", { deck: $scope.currentDeck, creatingDeck: true });
			// Reset data form
			$scope.currentDeck = DeckService.newDeck();
			$scope.search = TagService.newSearch();
		}
		else
			PopupService.showAlert($translate.instant('CREATEDECK.Create-deck'), $translate.instant('ERROR.No-deck-name'));
	};
})

.controller('CreateCardCtrl', function($scope, $stateParams, $state, $ionicLoading, $translate, $ionicHistory, $sce, $timeout, UserService, PopupService, TagService, DeckService, CardService) {
	
	$scope.currentCard = DeckService.newCard();
	// Variable used to display the tags results (autocomplete) and store the user input
	$scope.search = TagService.newSearch();
	// We get the type of cards
	$scope.cardTypes = CardService.getCardTypes();
	// Contains the HTML code for the answer (Fill in the blank mode only)
	$scope.htmlAnswer = "<span></span>";
	$scope.blanksValues = new Array();

	// We get the deck sent in parameter (we will add the card in that deck)
	$scope.currentDeck = $stateParams.deck;
	// We get the boolean to know if we are creating a new deck along with the card
	$scope.creatingDeck = $stateParams.creatingDeck
	// Check we successfully got the boolean
	if ($scope.creatingDeck == undefined) {
		PopupService.showAlert($translate.instant('ERROR.Error'), $translate.instant('ERROR.Error-occurred'));
		// Make the next page the root history
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.go("menu.myDecks");
	}
	// Check we successfully got the deck
	if ($scope.currentDeck == undefined) {
		PopupService.showAlert($translate.instant('ERROR.Error'), $translate.instant('ERROR.Cannot-get-deck'));
		// Redirect to the good state
		if ($scope.creatingDeck)
			$state.go("menu.createDeck");
		else {
			// Make the next page the root history
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.go("menu.myDecks");
		}
		return;
	}
	// If we have an ID field in the deck, use the DeckService to update the deck
	if ($scope.currentDeck._id != undefined) {
		var updatedDeck = DeckService.getDeckWithId($scope.currentDeck._id);
		if (updatedDeck != null)
			$scope.currentDeck = updatedDeck;
	}

	$scope.searchForTags = function() {
		// We use our TagService to get all the tags that match with the search variable
		$scope.search.foundTags = TagService.searchTags($scope.search.value, $scope.currentCard.tags);
	};

	// Add the tag in the deck list, and clear the search object
	$scope.addTag = function(tag) {
		TagService.addTag(tag, $scope.currentCard, $scope.search);
	};

	// Remove the tag in the deck list
	$scope.removeTag = function(tag) {
		TagService.removeTag(tag, $scope.currentCard, $scope.search);
	};

	// Update the answer string by using the blanks (Fill in the blank mode only)
	reformAnswerFromBlanks = function() {
		$scope.currentCard.answer = $scope.currentCard.question;
		var index = 0;
		while ($scope.currentCard.answer.indexOf("\[..\]") != -1) {
			if ($scope.blanksValues[index])
				$scope.currentCard.answer = $scope.currentCard.answer.replace("[..]", $scope.blanksValues[index]);
			else
				$scope.currentCard.answer = $scope.currentCard.answer.replace("[..]", "[xx]");
			index = index + 1;
		}
	}

	// Create the deck with the card in it
	$scope.createCard = function() {
		if ($scope.currentCard.type.value == "Fill in the blank")
			reformAnswerFromBlanks();
		if ($scope.currentCard.question.length > 0 && $scope.currentCard.answer.length > 0) {
			// Display a loading screen
			$ionicLoading.show({ template: $translate.instant('UTILS.Wait') + ' ...' });
			if ($scope.creatingDeck) {
				// Add the deck in our list of decks (we send a copy)
				var newDeck = DeckService.addDeck(UserService.getEmail(), _.extend({}, $scope.currentDeck));
				// When the DeckService has created the deck, we can add the card
				$scope.createDeck.promise.then(function() {
					// If we cannot added the new deck, we display an error and return
					if (newDeck._id == undefined) {
						// Hide the loading screen
						$ionicLoading.hide();
						PopupService.showAlert($translate.instant('CREATECARD.Create-card'), $translate.instant('ERROR.Error-occurred'));
						return;
					}
					// Else, we keep going
					$scope.currentDeck = newDeck;
					// Add the card in the deck
					$scope.currentDeck = DeckService.addCard($scope.currentCard, $scope.currentDeck);
					DeckService.getDecksDatabase();
					// Reset data form
					$scope.currentCard = DeckService.newCard();
					$scope.search = TagService.newSearch();
					// Hide the loading screen
					$ionicLoading.hide();
					// Make the next page the root history
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					$state.go("menu.myDecks");
				});
			}
			else {
				// Add the card in the deck
				$scope.currentDeck = DeckService.addCard($scope.currentCard, $scope.currentDeck);
				// Reset data form
				$scope.currentCard = DeckService.newCard();
				$scope.search = TagService.newSearch();
				// Hide the loading screen
				$ionicLoading.hide();
				// Redirect
				$state.go("menu.displayDeck", { deck: $scope.currentDeck, isBoughtDeck: false });
			}
		}
		else
			PopupService.showAlert($translate.instant('CREATECARD.Create-card'), $translate.instant('ERROR.Error-fields'));
	};

	// Add a blank to the question (Fill in the blank mode only)
	$scope.addBlankToQuestion = function() {
		// We get our input for the question
		var input = angular.element(document.getElementById('questionInput'));
		if (input == undefined)
			return;
		// Find where the cursor is
		var caretPos = input[0].selectionStart;
		if (caretPos == undefined)
			return;
		var text = input[0].value;
		// We create our blank text, and an int to know how many we need to move forward the cursor
		var moveCursor = 4;
		var blankText = "";
		// and we add a space before the blank if the user didn't put one
		if (caretPos > 0 && text[caretPos - 1] != ' ') {
			blankText = " ";
			moveCursor = moveCursor + 1;
		}
		blankText += "[..]";
		// Add a space after the blank if the user didn't put one
		if (text[caretPos] == undefined || text[caretPos] != ' ') {
			blankText += " ";
			moveCursor = moveCursor + 1;
		}
		// Add our blank
		input[0].value = text.substring(0, caretPos) + blankText + text.substring(caretPos);
		// Trigger the change event to force the UI to update, and put back the selection cursor
		input.triggerHandler('change');
		$timeout(function() {
			input[0].setSelectionRange(caretPos + moveCursor, caretPos + moveCursor);
			input[0].focus();
		});
	}

	// Save the value of the blank passed in parameter (use the index to identify which blank)
	$scope.saveBlankValue = function(index, element) {
		$scope.blanksValues[index] = element.value;
	};

	// Create an HTML part for the answer (Fill in the blank mode only)
	$scope.updateHTMLAnswer = function() {
		// We generate the HTML part to let the user fill the blanks
		var content = $scope.currentCard.question;
		var index = 0;
		while (content.indexOf("\[..\]") != -1) {
			var val = '';
			if ($scope.blanksValues[index])
				val = $scope.blanksValues[index];
			var blankText = $translate.instant('CREATECARD.Blank') + " " + (index + 1) + " ";
			content = content.replace("[..]", "<input type=\"text\" placeholder=\"" + blankText + "\" value=\"" + val + "\" onkeyup=\"angular.element(this).scope().saveBlankValue(" + index + ", this)\">");
			index = index + 1;
		}
		// Update the HTML variable
		$scope.htmlAnswer = "<span>" + content + "</span>";
	};
	$scope.getHTMLAnswer = function() {
		return $sce.trustAsHtml($scope.htmlAnswer);
	};
})

.controller('DisplayDeckCtrl', function($scope, $stateParams, $state, $ionicLoading, $translate, $ionicPopover, $ionicHistory, PopupService, DeckService, StoreService) {
	
	// We get the deck sent in parameter (we will display that deck)
	$scope.currentDeck = $stateParams.deck;
	// and the boolean to know if it's a bought deck
	$scope.isBoughtDeck = $stateParams.isBoughtDeck;

	// Variable to display the sell/remove buttons
	$scope.isWorking = false;

	// Variable to display the good html content
	$scope.isSelling = false;
	$scope.description = "";
	$scope.price = "";

	// Check we successfully got the deck id
	if ($scope.currentDeck == undefined || $scope.isBoughtDeck == undefined) {
		PopupService.showAlert($translate.instant('ERROR.Error'), $translate.instant('ERROR.Cannot-get-deck'));
		// Make the next page the root history
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.go("menu.myDecks");
	}

	// Get the number of unseen cards
	$scope.numberUnseenCards = function(deck) {
		return DeckService.getNbUnseenCards(deck);
	};

	// Move to the 'Create new card' page
	$scope.goToCreateCard = function() {
		// Redirect to the 'Create new card' page, and pass as parameter the deck
		$state.go("menu.createCard", { deck: $scope.currentDeck, creatingDeck: false });
	};

	// Start studying the deck
	$scope.studyDeck = function(studyMode, cardId) {
		// If the deck is empty, display a popup and return
		if ($scope.currentDeck.cards.length <= 0) {
			PopupService.showAlert($translate.instant('DISPLAYDECK.Empty-deck'), $translate.instant('DISPLAYDECK.Empty-deck-message'));
			return;
		}
		// Redirect to the 'Display card' page, and pass as parameter the deck
		$state.go("menu.displayCard", { deckId: $scope.currentDeck._id, cardId: cardId, studyMode: studyMode });
	};

	// Ask the user if he wants to delete the card
	$scope.deleteCard = function(card) {
		PopupService.showConfirm($translate.instant('DISPLAYDECK.Delete-card'), $translate.instant('DISPLAYDECK.Sure-delete-card'),
			// If the user pressed No
			function() {},
			// If the user pressed Yes
			function() {
				// Display a loading screen
				$ionicLoading.show({ template: $translate.instant('UTILS.Wait') + ' ...' });
				DeckService.removeCard(card, $scope.currentDeck, function() {
					// Hide the loading screen
					$ionicLoading.hide();
				}, function() {
					// Hide the loading screen
					$ionicLoading.hide();
				});
			}
		);
	};

	// Return a boolean if the StoreService is working
	$scope.isWorking = function() {
		return StoreService.isWorking();
	};

	// Boolean to choose which html content to display
	$scope.goToSellDeck = function(val) {
		$scope.isSelling = val;
	};

	// Sell the deck on the store
	$scope.sellDeck = function(price, description) {
		// If the deck is empty, display a popup and return
		if ($scope.currentDeck.cards.length <= 0) {
			PopupService.showAlert($translate.instant('DISPLAYDECK.Empty-deck'), $translate.instant('DISPLAYDECK.Empty-deck-message'));
			return;
		}
		PopupService.showConfirm($translate.instant('DISPLAYDECK.Sell'), $translate.instant('DISPLAYDECK.Sure-sell'),
			// If the user pressed No
			function() {},
			// If the user pressed Yes
			function() {
				// Display a loading screen
				$ionicLoading.show({ template: $translate.instant('UTILS.Wait') + ' ...' });
				// Get the price
				var newPrice = 0;
				if (price && price > 0)
					newPrice = price;
				// Put the deck on the store
				StoreService.addDeckOnStore($scope.currentDeck._id, description, newPrice,
					function() {
						// Success
						$scope.currentDeck.isOnline = true;
						// Hide the loading screen
						$ionicLoading.hide();
					}, function() {
						// Fail
						// Hide the loading screen
						$ionicLoading.hide();
						PopupService.showAlert($translate.instant('DISPLAYDECK.Sell'), $translate.instant('ERROR.Error-cannot-sell'));
					}
				);
				$scope.isSelling = false;
			}
		);
	};

	// Remove the deck from the store
	$scope.removeDeck = function() {
		// If the deck is empty, display a popup and return
		if ($scope.currentDeck.cards.length <= 0) {
			PopupService.showAlert($translate.instant('DISPLAYDECK.Empty-deck'), $translate.instant('DISPLAYDECK.Empty-deck-message'));
			return;
		}
		// Ask the user if he is really sure he wants to remove this deck from the store
		PopupService.showConfirm($translate.instant('DISPLAYDECK.Remove'), $translate.instant('DISPLAYDECK.Sure-remove'),
			// If the user pressed No
			function() {},
			// If the user pressed Yes
			function() {
				// Display a loading screen
				$ionicLoading.show({ template: $translate.instant('UTILS.Wait') + ' ...' });
				StoreService.removeDeckFromStore($scope.currentDeck._id,
					function() {
						// Success
						$scope.currentDeck.isOnline = false;
						// Hide the loading screen
						$ionicLoading.hide();
					}, function() {
						// Fail
						/// Hide the loading screen
						$ionicLoading.hide();
						PopupService.showAlert($translate.instant('DISPLAYDECK.Remove'), $translate.instant('ERROR.Error-cannot-remove'));
					}
				);
			}
		);
	};



	// Get the popover template
	$ionicPopover.fromTemplateUrl('displayDeckPopover.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.popover = popover;
	});
	$scope.openPopover = function($event) {
		$scope.popover.show($event);
	};
	$scope.closePopover = function() {
		$scope.popover.hide();
	};
	//Cleanup the popover when we're done with it!
	$scope.$on('$destroy', function() {
		$scope.popover.remove();
	});
})

.controller('DisplayCardCtrl', function($scope, $stateParams, $timeout, $translate, $state, $ionicHistory, CardService, PopupService, DeckService) {
	
	// We get the deck sent in parameter (we will display that deck)
	$scope.currentDeckId = $stateParams.deckId;
	// We get the boolean to determine if we are in study mode
	$scope.studyMode = $stateParams.studyMode;
	// Boolean to rotate the card
	$scope.flipped = false;
	// Boolean to hide the buttons
	$scope.showButtons = true;
	// An integerer to know if we can use the 'Previous card' option
	$scope.nbCardsSaw = 0;
	// Get our card element in the DOM
	var myCard = $('.col.list.card');
	// The duration of one animation
	var animationDuration = 300;
	// We get the card ID sent in parameter
	$scope.cardId = $stateParams.cardId;
	// Check we successfully got the deck id
	if ($scope.currentDeckId == undefined) {
		PopupService.showAlert($translate.instant('ERROR.Error'), $translate.instant('ERROR.Cannot-get-deck'));
		// Make the next page the root history
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.go("menu.myDecks");
	}
	// Check we successfully got the study mode boolean, else set default mode
	if ($scope.studyMode == undefined)
		$scope.studyMode = true;


	// Execute the animation passed in first argument
	// Then, execute the function passed in second argument
	// Finally, execute the last animation passed in third argument
	executeAnimation = function(animation1, fct, animation2) {
		// Hide the buttons
		$scope.showButtons = false;
		// Start our card animation
		myCard.addClass(animation1);
		// This code will be executed after the card animation
		$timeout(function() {
			if (fct)
				fct();
			myCard.removeClass(animation1);
			myCard.addClass(animation2);
		}, animationDuration);
		// Finally, when the 2 animations are done
		$timeout(function() {
			myCard.removeClass(animation2);
			// Show the buttons
			$scope.showButtons = true;
		}, animationDuration * 2);
	};
	// Get the next card by using the CardService. We have to send our current card, the deck and the study mode
	$scope.getNextCard = function() {
		executeAnimation('moveLeftGo', function() {
			$scope.flipped = false;
			$scope.currentCard = CardService.getNextCard($scope.currentCard, $scope.currentDeck, $scope.studyMode);
			$scope.nbCardsSaw += 1;
		}, 'moveRightReturn');
	};
	// Get the previous card we saw
	$scope.getPreviousCard = function() {
		if ($scope.nbCardsSaw <= 0)
			return;
		executeAnimation('moveRightGo', function() {
			$scope.flipped = false;
			$scope.currentCard = CardService.getPreviousCard($scope.currentDeck);
			$scope.nbCardsSaw -= 1;
		}, 'moveLeftReturn');
	};
	// Function to returns the card and show the answer
	$scope.rotateCard = function() {
		executeAnimation('moveTopGo', function() {
			$scope.flipped = true;
		}, 'moveTopReturn');
	};


	// Use the deck ID to find the complete deck
	$scope.currentDeck = DeckService.getDeckWithId($scope.currentDeckId);
	// If we don't have a card ID, we use the getNextCard function, but we reset the nbCardsSaw counter to 0
	// because that's our first card
	if ($scope.cardId == undefined) {
		$scope.currentCard = CardService.getNextCard(null, $scope.currentDeck, $scope.studyMode);
		if ($scope.currentCard == null && $scope.currentDeckId != undefined) {
			PopupService.showAlert($translate.instant('ERROR.Error'), $translate.instant('ERROR.Cannot-get-deck'));
			// Make the next page the root history
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.go("menu.myDecks");
		}
	}
	else {
		// We have a card ID, so we just need to find it in the deck, it will be our first card
		angular.forEach($scope.currentDeck.cards, function(curCard, index) {
			if (curCard.question == $scope.cardId) {
				$scope.currentCard = curCard;
				CardService.addIndexInStack(index);
				return;
			}
		});
	}
})

.controller('DeckstoreCtrl', function($scope, $state, StoreService, DeckService) {

	// Ask the StoreService to update all the decks
	StoreService.reset();
	StoreService.getFirstPage();

	// Search function
	$scope.searchDeckstore = function(search) {
		if (search && search.length > 0) {
			StoreService.setSearch(search);
			$state.go("menu.deckstoreDisplay", { storeService: StoreService.search });
		}
	};

	// --- New decks ---
	// Return the most recent decks in the store
	$scope.getNewStoreDecks = function() {
		return StoreService.newDecks.getDecks();
	};
	// Ask for the next page
	$scope.getNextNewStoreDecks = function() {
		StoreService.newDecks.getNextPage();
	};
	// Redirect the user to the 'See all' page
	$scope.goToSeeAllNewStoreDecks = function() {
		$state.go("menu.deckstoreDisplay", { storeService: StoreService.newDecks });
	};

	// --- Popular decks ---
	// Return the most downloaded decks in the store
	$scope.getPopularStoreDecks = function() {
		return StoreService.popularDecks.getDecks();
	};
	// Ask for the next page
	$scope.getNextPopularStoreDecks = function() {
		StoreService.popularDecks.getNextPage();
	};
	// Redirect the user to the 'See all' page
	$scope.goToSeeAllPopularStoreDecks = function() {
		$state.go("menu.deckstoreDisplay", { storeService: StoreService.popularDecks });
	};

	// --- User's decks ---
	// Return the user's decks currently in the store
	$scope.getUserStoreDecks = function() {
		return StoreService.userDecks.getDecks();
	};
	// Ask for the next page
	$scope.getNextUserStoreDecks = function() {
		StoreService.userDecks.getNextPage();
	};
	// Redirect the user to the 'See all' page
	$scope.goToSeeAllUserStoreDecks = function() {
		$state.go("menu.deckstoreDisplay", { storeService: StoreService.userDecks });
	};
})

.controller('DeckstoreDisplayCtrl', function($scope, $stateParams) {

	// We get the store service sent in parameter (can be 'New decks', 'Popular decks' or 'User decks')
	// this variable contains the good service, but we don't know which one (abstraction)
	var storeService = $stateParams.storeService;

	$scope.getTitle = function() {
		if (storeService)
			return storeService.getTitle();
		return "";
	};

	$scope.getDecks = function() {
		if (storeService)
			return storeService.getDecks();
		return [];
	};

	$scope.getNextPage = function() {
		if (storeService)
			storeService.getNextPage();
	};

	// This function is called everytime the user scroll
	// we check if we are at the bottom, and display the next page if needed
	$scope.isScrolling = function() {
		if (storeService) {
			storeService.getNextPage(function() {
				$scope.$broadcast('scroll.infiniteScrollComplete');
			}, function() {
				$scope.$broadcast('scroll.infiniteScrollComplete');
			});
		}
	}
})

.controller('BuyDeckCtrl', function($scope, $stateParams, $state, $translate, $ionicLoading, DeckService, PopupService, StoreService) {

	// We get the store element the user wants to buy
	$scope.storeElement = $stateParams.storeElement;
	if ($scope.storeElement == null)
		$state.go('menu.deckstore');

	// Function called when the user click on Buy/Download
	$scope.buyDeck = function(isOwned) {
		// If we already own this deck, just do nothing
		if (isOwned == true || $scope.storeElement == null)
			return;
		// Ask the user if he is sure
		PopupService.showConfirm($translate.instant('DECKSTORE.Buy'), $translate.instant('DECKSTORE.Sure-buy-deck'),
			// If the user pressed No
			function() {},
			// If the user pressed Yes
			function() {

				// Display a loading screen
				$ionicLoading.show({ template: $translate.instant('UTILS.Wait') + ' ...' });
				$scope.storeElement.isOwned = true;
				DeckService.buyDeck($scope.storeElement, function() {
					// Success
					StoreService.setElementOwned($scope.storeElement);
					// Hide the loading screen
					$ionicLoading.hide();
				}, function() {
					// Fail
					// Hide the loading screen
					$ionicLoading.hide();
					PopupService.showAlert($translate.instant('ERROR.Error'), $translate.instant('ERROR.Cannot-buy-deck'));
				});
			}
		);
	};
});