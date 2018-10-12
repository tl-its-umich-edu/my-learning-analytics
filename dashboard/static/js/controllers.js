visApp.controller('mainController', ['$scope', 'Get','$location', '$anchorScroll', function($scope, Get,$location,$anchorScroll) {

   function dataCall(){
        var dataFile = '/api/v1/courses/'+dashboard.course_id+'/assignment_view?percent='+$scope.percent_filter;
        Get.getData(dataFile).then(function(data) {
            $scope.data = data.data
            scrollId=1
            $scope.data.find(function (e) {
                current_week_indicator=e.due_date_items[0].assignment_items[0].current_week
                if(current_week_indicator){
                    return scrollId=e.id;
                }

            })
            $location.hash(scrollId);
            $anchorScroll();
        });
    }

    $scope.data=[]
    $scope.percentFilterEnabled=true;
    $scope.percent = [{ "value": 0, "text": "0% (all)" }, { "value": 2, "text": "2%" },{ "value": 5, "text": "5%" },
        { "value": 10, "text": "10%" },{ "value": 20, "text": "20%" },{ "value": 50, "text": "50%" },{ "value": 75, "text": "75%" }];
    $scope.percent_filter=$scope.percent[0].value;
    dataCall();

    $scope.updatePercentFilter = function() {
        dataCall();
    };




}]);
