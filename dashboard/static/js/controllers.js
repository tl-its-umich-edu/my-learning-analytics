visApp.controller('c1', ['$scope', '$log', 'Fetch', function ($scope, $log, Fetch) {
    $scope.data = [];
    $scope.weekFilterEnabled = true;
    $scope.gradeFilterEnabled = true;
        Fetch.getData('/static/json/top_file_access_week_grade.json').then(function(result) {
        $scope.raw = result.data;
        $scope.weeks = _.uniq(
            _.map(
                $scope.raw,
                function (item) {
                    return item.week;
                }
            )
        );
        $scope.grade = _.uniq(
            _.map(
                $scope.raw,
                function (item) {
                    return item.grade;
                }
            )
        );
        $scope.weeks.unshift('All Weeks');
        $scope.grade.unshift('All Grades');
        $scope.weeks_filter = $scope.weeks[0];
        $scope.grade_filter = $scope.grade[0];
        $scope.lastUsed = 'fileInteract';
        $scope.data = transFormFileInteract(result.data, $scope.weeks_filter,$scope.grade_filter);
    });
    $scope.options = {
        chart: {
            type: 'discreteBarChart',
            height: 450,
            margin: {
                top: 20,
                right: 20,
                bottom: 50,
                left: 55
            },
            x: function (d) {
                return d.label;
            },
            y: function (d) {
                return d.value;
            },
            showValues: false,
            duration: 500,
            xAxis: {
                axisLabel: 'Files',
                rotateLabels:-45
            },
            yAxis: {
                axisLabel: 'Interaction Count',
                axisLabelDistance: -10,
                tickFormat: function (d) {
                    return d;
                }
            }
        },
        title: {
            enable: true,
            text: 'Top five files accessed by week and Grade'
        },
        subtitle: {
            enable: true,
            html: '<code>x: Files, y: Interaction Count</code>'
        }
    };
    $scope.updateFilesFilter = function () {
        $log.warn($scope.lastUsed + ' ' + $scope.weeks_filter);
        switch ($scope.lastUsed) {
            case 'fileInteract':
                $scope.fileInteract();
                break;
        }
    };
    $scope.fileInteract = function () {
        $scope.weekFilterEnabled = true;
        $scope.gradeFilterEnabled = true;
        $scope.lastUsed = 'fileInteract';
        $scope.options.chart.yAxis.axisLabel = 'Interaction count';
        $scope.options.chart.xAxis.axisLabel = 'Files';
        $scope.options.chart.xAxis.rotateLabels = -45;
        $scope.useInteractiveGuideline = true;
        $scope.options.title = {
            enable: true,
            text: 'Top files accessed by Week and Grade'
        };
        $scope.options.subtitle = {
            enable: true,
            html: '<code>x: files, y: interaction count</code>'
        };
        $scope.options.chart.yAxis.tickFormat = function (d) {
            return d;
        };
        $scope.data = transFormFileInteract($scope.raw, $scope.weeks_filter,$scope.grade_filter);
    }



    var filterData = function (data, weekFilter,gradeFilter) {
        if(weekFilter === 'All Weeks' && gradeFilter ==='All Grades'){
            console.log('All Grade and Weeks case')
            data = data;
        }else if (weekFilter !== 'All Weeks' && gradeFilter !=='All Grades') {
            console.log('Grade or Weeks case'+weekFilter+" : "+gradeFilter)
            data = _.where(data, {week: weekFilter, grade:gradeFilter});
        }else if(weekFilter === 'All Weeks' || gradeFilter ==='All Grades'){
            console.log('Grade or Weeks case'+weekFilter+" : "+gradeFilter)
            data = (weekFilter ==='All Weeks')? _.where(data, {grade:gradeFilter}):_.where(data, {week: weekFilter});
        }
        return data;
    };

    var filterFileInteraction = function(data,filesFilter){
        data = _.where(data, {
            files: filesFilter
        });
        return data

    };

    var transFormFileInteract = function (data,weekFilter,gradeFilter){
        data = filterData(data, weekFilter,gradeFilter);
        returnData = [{
            key: "Cumulative Return",
            values: []
        }];

        if(weekFilter === 'All Weeks' && gradeFilter === 'All Grades'){
            console.log('All Grade and Weeks case')
            _.each(data, function (item) {
                fileCentricData = filterFileInteraction(data, item.files)
                var fileCount = 0;
                 _.each(fileCentricData, function (file) {
                    fileCount= fileCount+file.interactions;
                });

                returnData[0].values.push({
                    label: item.files,
                    value: fileCount
                });
            });

        }else {
            console.log('Grade or Weeks case'+weekFilter+" : "+gradeFilter)
            _.each(data, function (item) {
                fileCentricData = filterFileInteraction(data, item.files)
                var fileCount = 0;
                _.each(fileCentricData, function (file) {
                    fileCount= fileCount+file.interactions;
                });
                returnData[0].values.push({
                    label: item.files,
                    value: fileCount
                });
            });
        }

        if ($scope.sortBy === 'y') {
            returnData[0].values = _.sortBy(returnData[0].values, 'value').reverse();
        }
        return returnData;

    };
}]);

