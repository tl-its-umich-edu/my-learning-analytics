visApp.controller('mainController', ['$scope', 'Get', function($scope,  Get) {
    $scope.data=[]
    $scope.percentFilterEnabled=true;
    $scope.percent = ["0%","2%","5%","10%","20%","50%","75%"];
    $scope.percent_filter=$scope.percent[0];
    dataCall();

    $scope.updatePercentFilter = function() {
        dataCall();
    };

    function dataCall(){
        var selection = $scope.percent_filter;
        var dataFile = '/assignment_view?percent='+selection.substring(0, selection.length - 1);
        Get.getData(dataFile).then(function(data) {
            $scope.data = data.data
        });
    }



}]);
