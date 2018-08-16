var makeGraph = function () {
    d3.selectAll("#chart > *").remove();
    $.getJSON("/grade_distribution", function (initResult) {
        data = initResult;
        //defining the viz dimension
        var margin = {
                top: 30,
                right: 20,
                bottom: 40,
                left: 100
            },
            // Todo: adapt to response design
            width = 1700 - margin.left - margin.right,
            height = 680 - margin.top - margin.bottom;
        // x/y def
        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .5);

        var y = d3.scale.linear()
            .range([height, 0]);

        var y2 = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")

        var min = d3.min(data, function (d) {
            return d.score;
        });
        var xaxixValues = []
        for (var i = min; i <= 100; i = i + 2) {
            xaxixValues.push(i)
        }
        x.domain(xaxixValues);

        y.domain([0, d3.max(data, function (d) {
            return d.count;
        })]);
        y2.domain([0, d3.max(data, function (d) {
            return d.count;
        })]);

        //  tooltip for each bar
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                return '<p>Grade: ' + d.grade + '</p><p>Students with this score : ' + d.count + '</p>';
            })

        var svg = d3.select("#chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.call(tip);

        svg.append("g")
            .attr("class", "x axis")
            .attr("id", "gradeticks")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("transform",
                "translate(" + (width / 2 - margin.left) + " ," +
                (margin.top + 5) + ")")
            .style("text-anchor", "middle")
            .style("font-size", "15px")
            .style("font-weight", "bold")
            .text("(%) Grade");

        svg.append("g")
            .attr("class", "y axis")
            .attr("id", "studentCountticks")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "4em")
            .style("text-anchor", "middle")
            .style("font-size", "15px")
            .style("font-weight", "bold")
            .text("Number of students");

        // defining the bar for Chart
        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", function (d) {
                return 'bar ' + d.grade;
            })

            .attr("x", function (d) {
                return x(d.score);
            })
            .attr("width", x.rangeBand())
            .attr("y", function (d) {
                return y(d.count);
            })
            .attr("height", function (d) {
                return height - y(d.count);
            })

            .attr("data-legend", function (d) {
                return d.grade
            })
            .attr("data-legend-pos", function (d) {
                if (d.grade == 'A') {
                    return 1
                }
                if (d.grade == 'B') {
                    return 2
                }
                if (d.grade == 'C') {
                    return 3
                }
                if (d.grade == 'D') {
                    return 4
                }
                if (d.grade == 'E') {
                    return 5
                }
                if (d.grade == 'F') {
                    return 6
                }
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)

        svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .selectAll(".textlabel")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "textlabel")
            .attr("x", function (d) {
                return x(d.score);
            })
            .attr("y", function (d) {
                return y(d.count);
            })


        // Defining Legend for the Graph
        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .style("font-size", "12px")
            .attr("data-legend-title", "Grade")
            .attr("data-style-padding", 10)
            .call(d3.legend)

        //defining the vertical line to show MyGrade over-lay
        var myScore = data.map(d => d.my_score_actual)
        var line = d3.svg.line()
            .x((d, i) => {
                return x(myScore[0]) + 13
            })
            .y((d, i) => {
                return y2(i)
            })


        //Todo 1.make the "MyGrade" text appear on top of the line
        // Todo 2. Hover over line display student actual grade in the course
        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("id", "mygradepath")
            .attr("d", line)

        svg.append("text")
            .append("textPath")
            .attr("xlink:href", "#mygradepath")
            .style("font-size", "15px")
            .style("font-weight", "bold")
            .text("MyGrade");


        // giving a title to the chart
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .text("Grade Distribution");

        singleDataPoint = data[0]
        totalStudents = singleDataPoint.tot_students
        gradeAverage = singleDataPoint.grade_avg
        standardGradeDeviation = singleDataPoint.grade_stdev

        var gradeInfo = d3.select(".grade-info").append("div")
            .attr("class", "grade-details")
            .html('<p>Number of students: <b>' + totalStudents + '</b></p>' +
                '<p>Average grade: <b>' + gradeAverage + '</b></p>' +
                '<p>Standard deviation of grades: <b>' + standardGradeDeviation + '</b></p>')


    }).fail(function(jqXHR, textStatus, errorThrown) {
        var gradeInfo = d3.select(".error").append("div")
            .attr("class", "alert alert-danger")
            .attr("role","alert")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .html('Some error has occurred please try later or refresh the browser')
    });
};

makeGraph();
