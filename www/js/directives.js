angular.module('directives', [])

.directive('maintainRatio', function() {
	return function(scope, element, attrs) {
		angular.element(element).css('width', (element[0].offsetHeight - 20) + 'px');
	};
});