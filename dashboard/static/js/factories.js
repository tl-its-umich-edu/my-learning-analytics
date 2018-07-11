visApp.factory('Fetch', function ($http) {
  return {
    getData: function (url) {
      return $http.get(url, {cache: false}).then(
        function success(result) {
          //forward the data - let the controller deal with it
          return result;
        },
        function error(result) {
          //display a helpful error message
          return result;
        }
      );
    }
  };
});
