angular.module('starter.controllers', [])

.controller('OnBoardingCtrl', function($scope) {

})

.controller('LoginCtrl', function($scope, $state, $translate, UserService, PopupService) {
	// The user's login data
	$scope.loginData = {};

	// Perform the login action when the user submits the login form
	$scope.login = function() {
		// Try to connect the user
		if ($scope.loginData.username && $scope.loginData.username.length > 0 &&
			$scope.loginData.password && $scope.loginData.password.length > 0) {
			if (UserService.connect($scope.loginData.username, $scope.loginData.password)) {
				$scope.loginData = {};
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

	// Create a new account
	$scope.createAccount = function() {
		// Check all the fields
		if ($scope.accountData.username && $scope.accountData.username.length > 0 &&
			$scope.accountData.email && $scope.accountData.email.length > 0 &&
			$scope.accountData.password && $scope.accountData.password.length > 0) {
			// Try to create an account
			if (UserService.createAccount($scope.accountData.username, $scope.accountData.email, $scope.accountData.password)) {
				$state.go("login");
				PopupService.showAlert($translate.instant('NEWACCOUNT.New-account'), $translate.instant('NEWACCOUNT.Account-created'));
			}
			else
				PopupService.showAlert($translate.instant('NEWACCOUNT.New-account'), $translate.instant('ERROR.Email-used'));
		}
		else
			PopupService.showAlert($translate.instant('NEWACCOUNT.New-account'), $translate.instant('ERROR.Error-fields'));
	};
})

.controller('MenuCtrl', function($scope, $state, UserService) {
	$scope.UserService = UserService;

	// Disconnect the user
	$scope.logout = function() {
		UserService.disconnect();
		$state.go("login");
	}
})

.controller('MyDecksCtrl', function($scope) {
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
})

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
			console.log(users);
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
});