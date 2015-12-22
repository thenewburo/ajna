// Ionic Starter App
angular.module('starter', ['ionic', 'controllers', 'services', 'directives', 'pascalprecht.translate'])

.run(function($ionicPlatform, $rootScope, $state, UserService) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            //cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            //cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            StatusBar.hide();
        }
        ionic.Platform.isFullScreen = true;
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

    // Here we define all the routes
    // The permission field is used to know if the user has to be logged in to access this page
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
                templateUrl: 'templates/createDeck.html',
                controller: 'CreateDeckCtrl'
            }
        },
        data: {
            permission: true
        }
    })

    // deckId: used to find the deck to display
    .state('menu.displayDeck', {
        url: '/displayDeck',
        params: { deckId: null },
        views: {
            'menuContent': {
                templateUrl: 'templates/displayDeck.html',
                controller: 'DisplayDeckCtrl'
            }
        },
        data: {
            permission: true
        }
    })

    // cardId: is set if we are not in study mode
    // studyMode (boolean): if true we use our algorithm, if false we just iterate
    .state('menu.displayCard', {
        url: '/displayCard',
        params: { deckId: null, cardId: null, studyMode: null },
        views: {
            'menuContent': {
                templateUrl: 'templates/displayCard.html',
                controller: 'DisplayCardCtrl'
            }
        },
        data: {
            permission: true
        }
    })

    // creatingDeck (boolean): used to know if we come from the 'Create new deck' page
    .state('menu.createCard', {
        url: '/createCard',
        params: { deck: null, creatingDeck: null },
        views: {
            'menuContent': {
                templateUrl: 'templates/createCard.html',
                controller: 'CreateCardCtrl'
            }
        },
        data: {
            permission: true
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/onBoarding1');

    // Contains all the translation for each language
    $translateProvider.translations('en', {
        UTILS: {
            "Title": "EASY LEARNING",
            "Tags": "Tags",
            "Done-button": "Done",
            "Success": "Success"
        },
        ONBOARD: {
            "Text-page1": "Create your own flashcards in few minutes.",
            "Text-page2": "Study your deck whenever, wherever.",
            "Text-page3": "Buy/Sell your decks in the Deckstore.",
            "Skip-button": "Skip",
            "Next-button": "Next"
        },
        LOGIN: {
            "Username": "Username",
            "Password": "Password",
            "Sign-in": "Sign in",
            "Not-reg": "Don't have an account?",
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
            "Sign-up": "Sign up"
        },
        MYDECKS: {
            "My-decks": "My decks",
            "Unseen-cards": "unseen card(s)",
            "Add-deck": "Add a deck",
            "Refresh-decks": "Refresh decks",
            "Import-deck": "Import deck"
        },
        CREATEDECK: {
            "Create-deck": "Create a new deck",
            "Add-card": "Add a card",
            "Deck-name": "Deck name",
            "Deck-created": "The deck and his card have been created successfully"
        },
        CREATECARD: {
            "Create-card": "Create a new card",
            "Type": "Type",
            "Question": "Question",
            "Answer": "Answer",
            "Frequency": "Frequency",
            "Edit": "Edit"
        },
        DISPLAYDECK: {
            "Deck-options": "Deck options",
            "Custom-study": "Custom study",
            "Sell": "Sell",
            "Study": "Study"
        },
        DISPLAYCARD: {
            "Show-answer": "Show answer",
            "Previous-card": "Previous card",
            "Next-card": "Next-card"
        },
        ERROR: {
            "Error": "Error",
            "Error-occurred": "An error occurred while processing your request",
            "Cannot-connect": "Error, please check your username or password",
            "Email-used": "Error, that email address is already used",
            "Error-fields": "Error, please fill all the fields",
            "Email-incorrect": "Error, please enter a correct email address",
            "No-deck-name": "Error, please enter a name for the deck",
            "Cannot-get-deck": "Error, impossible to find the deck"
        }
    });

    // English language by default
    $translateProvider.preferredLanguage("en");
    $translateProvider.fallbackLanguage("en");
    $translateProvider.useSanitizeValueStrategy('escaped');
});