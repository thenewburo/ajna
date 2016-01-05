angular.module('directives', [])

// Directives to maintain ratio
.directive('maintainRatioWidth', function() {
	return function(scope, element, attrs) {
		angular.element(element).css('width', (element[0].offsetHeight - 20) + 'px');
	};
})
.directive('maintainRatioHeight', function() {
	return function(scope, element, attrs) {
		angular.element(element).css('height', (element[0].clientWidth) + 'px');
	};
})

// Directive used to display one deck in the store
.directive('storeElement', function($state) {
	return {
		restrict: 'A',
		templateUrl: '../templates/displayDeckInStore.html',
		scope: {
			storeElement: '=myStoreElement',
			showDescription: '=showDescription'
		},
		link: function(scope, elem, attrs) {
			scope.goToBuyDeck = function(storeElement) {
				$state.go('menu.buyDeck', { storeElement: storeElement });
			};
		}
	};
});