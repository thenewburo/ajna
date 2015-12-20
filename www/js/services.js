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
});