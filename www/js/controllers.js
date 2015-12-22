angular.module('controllers', [])

.controller('OnBoardingCtrl', function($scope, $ionicHistory) {
	// Make the next page the root history, so we can't use the back button to come back to the previous page
	$ionicHistory.nextViewOptions({
		disableBack: true
	});
})

.controller('LoginCtrl', function($scope, $state, $translate, $ionicHistory, UserService, PopupService) {
	// The user's login data
	$scope.loginData = {};

	// This function checks all the fields and returns 0 if everything is correct, else returns an error code
	checkLoginFields = function() {
		// One of the fields is empty
		if (!$scope.loginData.username || $scope.loginData.username.length <= 0 ||
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
				if (UserService.connect($scope.loginData.username, $scope.loginData.password)) {
					// Reset the fields
					$scope.loginData = {};
					// Make the next page the root history
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					// Redirect to 'My decks' page
					$state.go("menu.myDecks");
				}
				else
					PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant('ERROR.Cannot-connect'));
				break;

			// An error happened
			case 1:
				PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant('ERROR.Error-fields'));
				break;

			default:
		}
	};
})

.controller('NewAccountCtrl', function($scope, $state, $translate, UserService, PopupService) {
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
				// Try to create an account
				if (UserService.createAccount($scope.accountData.username, $scope.accountData.email, $scope.accountData.password)) {
					$state.go("login");
					PopupService.showAlert($translate.instant('NEWACCOUNT.New-account'), $translate.instant('NEWACCOUNT.Account-created'));
				}
				else
					PopupService.showAlert($translate.instant('NEWACCOUNT.New-account'), $translate.instant('ERROR.Email-used'));
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
	$scope.UserService = UserService;

	// Redirect to "My decks" page
	$scope.goToMyDecks = function() {
		$state.go("menu.myDecks");
		$ionicHistory.nextViewOptions({
			historyRoot: true
		});
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

.controller('MyDecksCtrl', function($scope, $ionicPopover, $state, $ionicHistory, DeckService) {
	// User's decks
	$scope.myDecks = [];

	// Ask our deckService to get all the decks
	$scope.myDecks = DeckService.getDecks();

	// Get the number of unseen cards
	$scope.numberUnseenCards = function(deck) {
		return DeckService.getNbUnseenCards(deck);
	};

	// Redirect to display a deck
	$scope.displayDeck = function(deckId) {
		$state.go("menu.displayDeck", { deckId: deckId });
		$ionicHistory.nextViewOptions({
			historyRoot: true
		});
	}



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

.controller('CreateCardCtrl', function($scope, $stateParams, $state, $translate, $ionicHistory, PopupService, TagService, DeckService) {
	$scope.currentCard = DeckService.newCard();
	// Variable used to display the tags results (autocomplete) and store the user input
	$scope.search = TagService.newSearch();
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
	}
	// If we have an ID field in the deck, use the DeckService to update the deck
	if ($scope.currentDeck.id != undefined) {
		var updatedDeck = DeckService.getDeckWithId($scope.currentDeck.id);
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

	// Create the deck with the card in it
	$scope.createCard = function() {
		if ($scope.currentCard.question.length > 0 && $scope.currentCard.answer.length > 0) {

			if ($scope.creatingDeck) {
				// Add the deck in our list of decks (we send a copy)
				$scope.currentDeck = DeckService.addDeck(_.extend({}, $scope.currentDeck));
			}
			// Add the card in the deck
			$scope.currentDeck = DeckService.addCard($scope.currentCard, $scope.currentDeck);
			// Reset data form
			$scope.currentCard = DeckService.newCard();
			$scope.search = TagService.newSearch();

			if ($scope.creatingDeck) {
				// Make the next page the root history
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go("menu.myDecks");
			}
			else
				$state.go("menu.displayDeck", { deckId: $scope.currentDeck.id });
		}
		else
			PopupService.showAlert($translate.instant('CREATECARD.Create-card'), $translate.instant('ERROR.Error-fields'));
	};
})

.controller('DisplayDeckCtrl', function($scope, $stateParams, $state, $translate, $ionicPopover, PopupService, DeckService) {
	// We get the deck sent in parameter (we will display that deck)
	$scope.currentDeckId = $stateParams.deckId;

	// Check we successfully got the deck id
	if ($scope.currentDeckId == undefined) {
		PopupService.showAlert($translate.instant('ERROR.Error'), $translate.instant('ERROR.Cannot-get-deck'));
		$state.go("menu.myDecks");
	}

	// Use the deck ID to find the complete deck
	$scope.currentDeck = DeckService.getDeckWithId($scope.currentDeckId);

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
		// Redirect to the 'Display card' page, and pass as parameter the deck
		$state.go("menu.displayCard", { deckId: $scope.currentDeck.id, cardId: cardId, studyMode: studyMode });
	}



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

.controller('DisplayCardCtrl', function($scope, $stateParams, CardService, DeckService) {
	// We get the deck sent in parameter (we will display that deck)
	$scope.currentDeckId = $stateParams.deckId;
	// We get the boolean to determine if we are in study mode
	$scope.studyMode = $stateParams.studyMode;
	// An integerer to know if we can use the 'Previous card' option
	$scope.nbCardsSaw = 0;
	// We get the card ID sent in parameter
	$scope.cardId = $stateParams.cardId;
	// Check we successfully got the deck id
	if ($scope.currentDeckId == undefined) {
		PopupService.showAlert($translate.instant('ERROR.Error'), $translate.instant('ERROR.Cannot-get-deck'));
		$state.go("menu.myDecks");
	}
	// Check we successfully got the study mode boolean, else set default mode
	if ($scope.studyMode == undefined)
		$scope.studyMode = true;


	// Get the next card by using the CardService. We have to send our current card, the deck and the study mode
	$scope.getNextCard = function() {
		$scope.currentCard = CardService.getNextCard($scope.currentCard, $scope.currentDeck, $scope.studyMode);
		$scope.nbCardsSaw += 1;
	};
	// Get the previous card we saw
	$scope.getPreviousCard = function() {
		if ($scope.nbCardsSaw <= 0)
			return;
		$scope.currentCard = CardService.getPreviousCard($scope.currentDeck);
		$scope.nbCardsSaw -= 1;
	};


	// Use the deck ID to find the complete deck
	$scope.currentDeck = DeckService.getDeckWithId($scope.currentDeckId);
	// If we don't have a card ID, we use the getNextCard function, but we reset the nbCardsSaw counter to 0
	// because that's our first card
	if ($scope.cardId == undefined)
		$scope.currentCard = CardService.getNextCard(null, $scope.currentDeck, $scope.studyMode);
	else {
		// We have a card ID, so we just need to find it in the deck, it will be our first card
		angular.forEach($scope.currentDeck.cards, function(curCard, index) {
			if (curCard.id == $scope.cardId) {
				$scope.currentCard = curCard;
				CardService.addIndexInStack(index);
				return;
			}
		});
	}
});