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

	// Perform the login action when the user submits the login form
	$scope.login = function() {
		// Try to connect the user
		if ($scope.loginData.username && $scope.loginData.username.length > 0 &&
			$scope.loginData.password && $scope.loginData.password.length > 0) {
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
		}
		else
			PopupService.showAlert($translate.instant('LOGIN.Sign-in'), $translate.instant('ERROR.Error-fields'));
	};
})

.controller('NewAccountCtrl', function($scope, $state, $translate, UserService, PopupService) {
	// Variable to temporarily store the user's data
	$scope.accountData = {};

	// This function tests all the fields and returns 0 if everything is correct, else returns an error code
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
				break;
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
	}

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

.controller('CreateDeckCtrl', function($scope) {

})

.controller('CreateCardCtrl', function($scope) {

});