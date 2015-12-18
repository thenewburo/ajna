// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
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

    .state('app.browse', {
            url: '/browse',
            views: {
                'menuContent': {
                    templateUrl: 'templates/browse.html'
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

    // Set the path to the translation files
    $translateProvider.useStaticFilesLoader({
        prefix: '../lng/locale-',
        suffix: '.json'
    });

    // English by default
    $translateProvider.useSanitizeValueStrategy('escaped');
    $translateProvider.preferredLanguage('EN');

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/onBoarding1');
});
