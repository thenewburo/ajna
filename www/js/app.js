// Ionic Starter App
angular.module('starter', ['ionic', 'controllers', 'services', 'directives', 'pascalprecht.translate', 'ngSanitize'])

.constant("server", { url: "http://173.255.197.21", port: "8080" })

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
})

.config(function($stateProvider, $urlRouterProvider, $translateProvider) {

    // Here we define all the routes
    $stateProvider
    .state('onBoarding', {
        url: '/onBoarding',
        templateUrl: 'templates/onBoardingPage.html',
        controller: 'OnBoardingCtrl'
    })

    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    })

    .state('newAccount', {
        url: '/newAccount',
        templateUrl: 'templates/newAccount.html',
        controller: 'NewAccountCtrl'
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
        }
    })

    .state('menu.createDeck', {
        url: '/createDeck',
        views: {
            'menuContent': {
                templateUrl: 'templates/createDeck.html',
                controller: 'CreateDeckCtrl'
            }
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
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/onBoarding');

    // Contains all the translation for each language
    $translateProvider.translations('en', {
        UTILS: {
            "Title": "EASY LEARNING",
            "Tags": "Tags",
            "Done-button": "Done",
            "Success": "Success",
            "Yes": "Yes",
            "No": "No"
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
            "Import-deck": "Import deck",
            "Delete-deck": "Delete deck",
            "Sure-delete-deck": "Are you sure you want to delete this deck?"
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
            "Edit": "Edit",
            "Blank": "Blank"
        },
        DISPLAYDECK: {
            "Deck-options": "Deck options",
            "Custom-study": "Custom study",
            "Sell": "Sell",
            "Study": "Study",
            "Empty-deck": "Empty deck",
            "Empty-deck-message": "The deck is empty, please add a card",
            "Delete-card": "Delete card",
            "Sure-delete-card": "Are you sure you want to delete this card?"
        },
        DISPLAYCARD: {
            "Show-answer": "Show answer",
            "Previous-card": "Previous card",
            "Next-card": "Next card"
        },
        ERROR: {
            "Error": "Error",
            "Error-occurred": "An error occurred while processing your request",
            "Cannot-connect": "Error, please check your username or password",
            "Email-used": "Error, that email address is already used",
            "Error-fields": "Error, please fill all the fields",
            "Email-incorrect": "Error, please enter a correct email address",
            "No-deck-name": "Error, please enter a name for the deck",
            "Cannot-get-deck": "Error, impossible to find the deck",
            "Error-token": "Error, failed to authenticate the token"
        }
    });

    // English language by default
    $translateProvider.preferredLanguage("en");
    $translateProvider.fallbackLanguage("en");
    $translateProvider.useSanitizeValueStrategy('escaped');
});