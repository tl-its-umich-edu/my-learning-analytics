visApp.controller('mainController', ['$scope', 'Get','$location', '$anchorScroll', function($scope, Get,$location,$anchorScroll) {
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
            $scope.data.forEach(function (e) {
                current_week_indicator=e.due_date_items[0].assignment_items[0].current_week
                if(current_week_indicator){
                    $location.hash(e.id);
                    $anchorScroll();
                }
            });
        });
    }



}]);
