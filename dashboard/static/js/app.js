var visApp = angular.module('visApp', []);

// ensure csrf safe calls
// https://docs.djangoproject.com/en/2.1/ref/csrf/#acquiring-the-token-if-csrf-use-sessions-or-csrf-cookie-httponly-is-true
visApp.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}]);