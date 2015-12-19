// Ionic Starter App
angular.module('starter', ['ionic', 'starter.controllers', 'pascalprecht.translate'])

.run(function($ionicPlatform) {
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
})

.config(function($stateProvider, $urlRouterProvider, $translateProvider) {
    $stateProvider

    .state('onBoarding1', {
        url: '/onBoarding1',
        templateUrl: 'templates/onBoardingPage1.html',
        controller: 'OnBoardingCtrl'
    })

    .state('onBoarding2', {
        url: '/onBoarding2',
        templateUrl: 'templates/onBoardingPage2.html',
        controller: 'OnBoardingCtrl'
    })

    .state('onBoarding3', {
        url: '/onBoarding3',
        templateUrl: 'templates/onBoardingPage3.html',
        controller: 'OnBoardingCtrl'
    })

    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    })

    .state('newAccount', {
        url: '/newAccount',
        templateUrl: 'templates/newAccount.html'
    })

    .state('myDecks', {
        url: '/myDecks',
        templateUrl: 'templates/myDecks.html'
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
            "Sign-facebook": "Sign in with Facebook",
            "Sign-google": "Sign in with Google+",
            "Sign-twitter": "Sign in with Twitter"
        },
        NEWACCOUNT: {
            "New-account": "New account"
        },
        MYDECKS: {
            "My-decks": "My decks"
        }
    });

    // English by default
    $translateProvider.preferredLanguage("en");
    $translateProvider.fallbackLanguage("en");
    $translateProvider.useSanitizeValueStrategy('escaped');

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/onBoarding1');
});




/*
    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })

    .state('app.search', {
        url: '/search',
        views: {
            'menuContent': {
                templateUrl: 'templates/search.html'
            }
        }
    })


        .state('app.playlists', {
            url: '/playlists',
            views: {
                'menuContent': {
                    templateUrl: 'templates/playlists.html',
                    controller: 'PlaylistsCtrl'
                }
            }
        })

    .state('app.single', {
        url: '/playlists/:playlistId',
        views: {
            'menuContent': {
                templateUrl: 'templates/playlist.html',
                controller: 'PlaylistCtrl'
            }
        }
    });*/