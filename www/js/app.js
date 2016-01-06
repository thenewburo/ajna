// Ionic Starter App
angular.module('starter', ['ionic', 'controllers', 'services', 'directives', 'pascalprecht.translate', 'ngSanitize', 'ngCookies'])

// Linode address: 173.255.197.21
.constant("server", { url: "http://173.255.197.21", port: "8080" })

.run(function($ionicPlatform) {
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

.config(function($stateProvider, $urlRouterProvider, $translateProvider, $httpProvider) {

    // If we get a 403 response from a request, redirect to login page by using the 'responseObserver' service
    $httpProvider.interceptors.push('responseObserver');
    
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

    .state('menu.myAccount', {
        url: '/My-account',
        cache: false,
        views: {
            'menuContent': {
                templateUrl: 'templates/myAccount.html',
                controller: 'MyAccountCtrl'
            }
        }
    })

    .state('menu.myDecks', {
        url: '/myDecks',
        cache: false,
        views: {
            'menuContent': {
                templateUrl: 'templates/myDecks.html',
                controller: 'MyDecksCtrl'
            }
        }
    })

    .state('menu.createDeck', {
        url: '/createDeck',
        cache: false,
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
        cache: false,
        params: { deck: null, isBoughtDeck: null },
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
        cache: false,
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
        cache: false,
        params: { deck: null, creatingDeck: null },
        views: {
            'menuContent': {
                templateUrl: 'templates/createCard.html',
                controller: 'CreateCardCtrl'
            }
        }
    })

    .state('menu.deckstore', {
        url: '/deckstore',
        cache: false,
        views: {
            'menuContent': {
                templateUrl: 'templates/deckstore.html',
                controller: 'DeckstoreCtrl'
            }
        }
    })

    // storeService is one of the StoreService object
    // it contains some functions to get the decks from the store
    .state('menu.deckstoreDisplay', {
        url: '/deckstoreDisplay',
        params: { storeService: null },
        views: {
            'menuContent': {
                templateUrl: 'templates/deckstoreDisplay.html',
                controller: 'DeckstoreDisplayCtrl'
            }
        }
    })

    .state('menu.buyDeck', {
        url: '/buyDeck',
        cache: false,
        params: { storeElement: null },
        views: {
            'menuContent': {
                templateUrl: 'templates/buyDeck.html',
                controller: 'BuyDeckCtrl'
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
            "No": "No",
            "Cancel": "Cancel",
            "Wait": "Please wait",
            "Cards": "Card(s)"
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
        MYACCOUNT: {
            "My-account": "My account",
            "Decks": "Deck(s)",
            "Decks-sold": "Deck(s) sold",
            "Decks-on-sale": "Deck(s) on sale",
            "Connect-with": "Connect with"
        },
        NEWACCOUNT: {
            "New-account": "New account",
            "Creating": "Creating new account",
            "Name": "Name",
            "Email": "Email",
            "Account-created": "Your account has been created successfully",
            "Sign-up": "Sign up"
        },
        MYDECKS: {
            "My-decks": "My decks",
            "Bought-decks": "Bought decks",
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
            "Sure-sell": "Are you sure you want to sell this deck on the store?",
            "Remove": "Remove",
            "Sure-remove": "Are you sure you want to remove this deck from the store?",
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
        DECKSTORE: {
            "Deckstore": "Deckstore",
            "Description": "Description",
            "Price": "Price",
            "By": "by",
            "Created-by": "created by",
            "Currency": "$",
            "Buy": "Buy",
            "Free": "Free",
            "Owned": "Owned",
            "See-all": "See all >",
            "Popular-decks": "Popular decks",
            "New-decks": "New decks",
            "Buy-deck": "Buy deck",
            "Sure-buy-deck": "Are you sure you want to buy this deck?",
            "Search": "Search"
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
            "Error-token": "Error, failed to authenticate the token",
            "Error-deck-online": "Error, cannot delete a deck currently available on the store",
            "Error-cannot-sell": "Error, cannot put this deck on the store",
            "Error-cannot-remove": "Error, cannot delete this deck from the store",
            "Cannot-buy-deck": "Error, cannot buy this deck"
        }
    });

    // English language by default
    $translateProvider.preferredLanguage("en");
    $translateProvider.fallbackLanguage("en");
    $translateProvider.useSanitizeValueStrategy('escaped');
});