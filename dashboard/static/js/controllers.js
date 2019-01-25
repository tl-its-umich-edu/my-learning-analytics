visApp.controller('mainController', ['$scope', 'Service','$location', '$anchorScroll', function($scope, Service,$location,$anchorScroll) {
    function dataCall(call, default_value){
        if (typeof default_value !== 'undefined') {
            $scope.percent_filter = default_value;
        }
        var dataFile = '/api/v1/courses/' + dashboard.course_id + '/assignments?percent=' + $scope.percent_filter;
        Service.getData(dataFile).then(function (data) {
            if (_.isEmpty(data.data)) {
                $scope.plan = [];
                $scope.progress = [];
                return;
            }
            $scope.plan = data.data.plan;
            $scope.progress = data.data.progress;
            // call the js file onload only
            if (call == 'assign-progress.js') {
                $.getScript("/static/js/" + call)
            }
            scrollId = 1
            $scope.plan.find(function (e) {
                current_week_indicator = e.due_date_items[0].assignment_items[0].current_week;
                if (current_week_indicator) {
                    return scrollId = e.id;
                }

            })
            $location.hash(scrollId);
            $anchorScroll();
        });
    }
    // get the user default selection from DB and if not available selects the first item from the dropdown list
    get_default_selection = function () {
        let get_defaults_url = '/api/v1/courses/' + dashboard.course_id + '/get_user_default_selection?default_type=assignment';
        let re = Service.getData(get_defaults_url)
        re.then(function (data) {
            if (_.isEmpty(data.data.default)) {
                default_value = $scope.percent[0].value;
            } else {
                default_value = data.data.default;
            }
            $scope.percent_filter = default_value;
            $scope.default_selection_value_holder = default_value;
            $scope.isResetMyDefaultCheckboxEnabled = false;
            dataCall('assign-progress.js', default_value);
        })

    }

    $scope.percentFilterEnabled=true;
    $scope.default_selection_model=false;
    const REMEMBER_MY_SETTING = 'Remember my setting';
    const MY_CURRENT_SETTING = 'My current setting';
    const SETTING_NOT_UPDATED_MSG = 'Setting not updated';
    $scope.default_setting ={msg:MY_CURRENT_SETTING};
    $scope.percent = [{ 'value': "0", 'text': "0% (all)" }, { 'value': "2", 'text': "2%" },{ 'value': "5", 'text': "5%" },
        { 'value': "10", 'text': "10%" },{ 'value': "20", 'text': "20%" },{ 'value': "50", 'text': "50%" },{ 'value': "75", 'text': "75%" }];
    get_default_selection();


    $scope.updatePercentFilter = function () {
        if ($scope.percent_filter !== $scope.default_selection_value_holder && $scope.percent_filter !== 0) {
            $scope.isResetMyDefaultCheckboxEnabled = true;
            $scope.default_setting.msg = REMEMBER_MY_SETTING;
        } else {
            $scope.isResetMyDefaultCheckboxEnabled = false;
            $scope.default_setting.msg = MY_CURRENT_SETTING;
        }
        dataCall();
    };

    $scope.sendDefaults = function () {
        $scope.isResetMyDefaultCheckboxEnabled = false;
        if ($scope.default_selection_model) {
            var url = '/api/v1/courses/' + dashboard.course_id + '/set_user_default_selection';
            let putData = {"assignment":$scope.percent_filter};
            Service.putDefaults(url, putData).then(function(data){
                if (data.data.default === 'fail') {
                    $scope.default_setting.msg = SETTING_NOT_UPDATED_MSG;
                    $scope.default_selection_model = false;
                    return;
                }
                $scope.default_selection_model = false;
                $scope.default_selection_value_holder = $scope.percent_filter;
                $scope.default_setting.msg = MY_CURRENT_SETTING;
            });
        }
    }

}]);
