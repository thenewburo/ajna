angular.module('starter.controllers', [])

.controller('OnBoardingCtrl', function($scope) {
    
})

.controller('LoginCtrl', function($scope, $state) {
	// The user's login data
	$scope.loginData = {};

	// Perform the login action when the user submits the login form
	$scope.login = function() {
		// Try to connect the user
		if ($scope.loginData.username == "root" && $scope.loginData.password == "root")
			$state.go("myDecks");
	};
});