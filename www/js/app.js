// Ionic Starter App
angular.module('starter', ['ionic', 'starter.controllers', 'pascalprecht.translate'])

.run(function($ionicPlatform, $rootScope, $state, UserService) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.hide();
        }
    });
    // Every time the user change to another page
    $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
        if (toState && toState.data && toState.data.permission == true && UserService.isUserConnected() == false) {
            event.preventDefault();
            $state.go("login");
        }
    });
})

.config(function($stateProvider, $urlRouterProvider, $translateProvider) {

    $stateProvider
    .state('onBoarding1', {
        url: '/onBoarding1',
        templateUrl: 'templates/onBoardingPage1.html',
        controller: 'OnBoardingCtrl',
        data: {
            permission: false
        }
    })

    .state('onBoarding2', {
        url: '/onBoarding2',
        templateUrl: 'templates/onBoardingPage2.html',
        controller: 'OnBoardingCtrl',
        data: {
            permission: false
        }
    })

    .state('onBoarding3', {
        url: '/onBoarding3',
        templateUrl: 'templates/onBoardingPage3.html',
        controller: 'OnBoardingCtrl',
        data: {
            permission: false
        }
    })

    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl',
        data: {
            permission: false
        }
    })

    .state('newAccount', {
        url: '/newAccount',
        templateUrl: 'templates/newAccount.html',
        controller: 'NewAccountCtrl',
        data: {
            permission: false
        }
    })

    .state('menu', {
        url: '/menu',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'MenuCtrl'
    })

    .state('menu.myDecks', {
        url: '/myDecks',
        views: {
            'menuContent': {
                templateUrl: 'templates/myDecks.html',
                controller: 'MyDecksCtrl'
            }
        },
        data: {
            permission: true
        }
    })

    .state('menu.createDeck', {
        url: '/createDeck',
        views: {
            'menuContent': {
                templateUrl: 'templates/createDeck.html'
            }
        },
        data: {
            permission: true
        }
    });

    // Contains all the translation for each language
    $translateProvider.translations('en', {
        UTILS: {
            "Title": "EASY LEARNING"
        },
        ONBOARD: {
            "Text-page1": "Create your own flashcards in few minutes.",
            "Text-page2": "Study your deck whenever, wherever.",
            "Text-page3": "Buy/Sell your decks in the Deckstore.",
            "Skip-button": "Skip",
            "Next-button": "Next",
            "Done-button": "Done"
        },
        LOGIN: {
            "Username": "Username",
            "Password": "Password",
            "Sign-in": "Sign in",
            "Not-reg": "Don't have an account?",
            "Sign-up": "Sign up",
            "Logout": "Logout",
            "Sign-facebook": "Sign in with Facebook",
            "Sign-google": "Sign in with Google+",
            "Sign-twitter": "Sign in with Twitter"
        },
        NEWACCOUNT: {
            "New-account": "New account",
            "Name": "Name",
            "Email": "Email",
            "Account-created": "Your account has been created successfully",
        },
        MYDECKS: {
            "My-decks": "My decks",
            "Unseen-cards": "unseen card(s)",
            "Add-deck": "Add a deck"
        },
        CREATEDECK: {
            "Create-deck": "Create a new deck"
        },
        ERROR: {
            "Cannot-connect": "Error: username and password do not match",
            "Email-used": "Error: that email address is already used",
            "Error-fields": "Error: please fill all the fields"
        }
    });

    // English by default
    $translateProvider.preferredLanguage("en");
    $translateProvider.fallbackLanguage("en");
    $translateProvider.useSanitizeValueStrategy('escaped');

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/onBoarding1');
});