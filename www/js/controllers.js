angular.module('controllers', [])

.controller('OnBoardingCtrl', function($scope, $ionicHistory, $state, $ionicSlideBoxDelegate) {

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

.controller('MyDecksCtrl', function($scope, $ionicPopover, $state, $ionicHistory, $translate, DeckService, PopupService) {
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
	};

	// Ask the user if he wants to delete the deck
	$scope.deleteDeck = function(deck) {
		PopupService.showConfirm($translate.instant('MYDECKS.Delete-deck'), $translate.instant('MYDECKS.Sure-delete-deck'),
			// If the user pressed No
			function() {},
			// If the user pressed Yes
			function() {
				DeckService.removeDeck(deck);
				// Ask our deckService to get all the decks to refresh the list
				$scope.myDecks = DeckService.getDecks();
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

.controller('CreateCardCtrl', function($scope, $stateParams, $state, $translate, $ionicHistory, $sce, $timeout, PopupService, TagService, DeckService, CardService) {
	$scope.currentCard = DeckService.newCard();
	// Variable used to display the tags results (autocomplete) and store the user input
	$scope.search = TagService.newSearch();
	// We get the deck sent in parameter (we will add the card in that deck)
	$scope.currentDeck = $stateParams.deck;
	// We get the boolean to know if we are creating a new deck along with the card
	$scope.creatingDeck = $stateParams.creatingDeck
	// We get the type of cards
	$scope.cardTypes = CardService.getCardTypes();
	// Contains the HTML code for the answer (Fill in the blank mode only)
	$scope.htmlAnswer = "<span></span>";
	$scope.blanksValues = new Array();

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
		// If the deck is empty, display a popup and return
		if ($scope.currentDeck.cards.length <= 0) {
			PopupService.showAlert($translate.instant('DISPLAYDECK.Empty-deck'), $translate.instant('DISPLAYDECK.Empty-deck-message'));
			return;
		}
		// Redirect to the 'Display card' page, and pass as parameter the deck
		$state.go("menu.displayCard", { deckId: $scope.currentDeck.id, cardId: cardId, studyMode: studyMode });
	};

	// Ask the user if he wants to delete the card
	$scope.deleteCard = function(card) {
		PopupService.showConfirm($translate.instant('DISPLAYDECK.Delete-card'), $translate.instant('DISPLAYDECK.Sure-delete-card'),
			// If the user pressed No
			function() {},
			// If the user pressed Yes
			function() {
				DeckService.removeCard(card, $scope.currentDeck);
			}
		);
	};

	// Sell the deck on the store
	$scope.sellDeck = function() {
		// If the deck is empty, display a popup and return
		if ($scope.currentDeck.cards.length <= 0) {
			PopupService.showAlert($translate.instant('DISPLAYDECK.Empty-deck'), $translate.instant('DISPLAYDECK.Empty-deck-message'));
			return;
		}
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

.controller('DisplayCardCtrl', function($scope, $stateParams, $timeout, CardService, DeckService) {
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