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
	};

	// Disconnect the user
	$scope.logout = function() {
		UserService.disconnect();

		$state.go("login");
	};
})

.controller('MyDecksCtrl', function($scope, $ionicPopover) {
	// User's decks
	$scope.myDecks = [];

	$scope.myDecks.push(
		{
			id: 0,
			name: 'First deck example',
			image: '',
			tags: [],
			isFavorite: false,
			cards: [
				{
					id: 0,
					type: 'Question',
					question: 'What year are we in?',
					answer: '2015',
					frequency: 1,
					tags: [],
					seen: false
				},
				{
					id: 1,
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
					id: 1,
					type: 'Question',
					question: 'What year are we in?',
					answer: '2015',
					frequency: 1,
					tags: [],
					seen: false
				}
			]
		}
	);

	// Get the number of unseen cards
	$scope.numberUnseenCards = function(deck) {
		var nb = 0;
		angular.forEach (deck.cards, function(card) {
			if (card.seen == false)
				nb++;
		});
		return nb;
	};

	// .fromTemplateUrl() method
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

.controller('CreateDeckCtrl', function($scope, $state, $translate, PopupService, TagService) {
	// Variable that contains our new deck informations
	$scope.currentDeck = {
		name: '',
		image: '',
		tags: [],
		isFavorite: false,
		cards: []
	};
	// Variable used to display the tags results (autocomplete) and store the user input
	$scope.search = { value: "", foundTags: [] };

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

	$scope.goToCreateCard = function() {
		// Check the user put at least a name for the deck
		if ($scope.currentDeck.name.length > 0) {
			// Redirect to the 'Create new card' page, and pass as parameter the new deck
			$state.go("menu.createCard", { deck: $scope.currentDeck });
		}
		else
			PopupService.showAlert($translate.instant('CREATEDECK.Create-deck'), $translate.instant('ERROR.No-deck-name'));
	};
})

.controller('CreateCardCtrl', function($scope, $stateParams, $state, $translate, PopupService) {
	// We get the deck sent in parameter (we will add the card in that deck)
	$scope.currentDeck = $stateParams.deck;

	// Check we successfully got the deck
	if ($scope.currentDeck == undefined) {
		PopupService.showAlert($translate.instant('ERROR.Error'), $translate.instant('ERROR.Cannot-get-deck'));
		$state.go("menu.createDeck")
	}
});