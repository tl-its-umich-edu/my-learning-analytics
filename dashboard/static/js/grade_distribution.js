var makeGraph = function () {
    $.getJSON("/api/v1/courses/"+dashboard.course_id+"/grade_distribution", function (initResult) {
        data = initResult;
        if(_.isEmpty(data)){
            var gradeInfo = d3.select("#chart").append("div")
                .attr("class", "alert alert-info")
                .attr("role","alert")
                .style("font-size", "20px")
                .style("font-weight", "bold")
                .html('No data for the view')
            return;
        }
        // over all course statistics
        singleDataPoint = data[0];
        totalStudents = singleDataPoint.tot_students;
        gradeAverage = singleDataPoint.grade_avg;
        standardGradeDeviation = singleDataPoint.grade_stdev;
        myscore=singleDataPoint.current_user_grade
        myscoreText= singleDataPoint.current_user_grade+"%"

        // get the current grade
        bin_grades = [];
        data_more_than_100_percent = singleDataPoint.more_than_100_percent;
        data.forEach(function (e) {
            bin_grades.push(e.current_grade)
        })

        var width = 1000,
            height = 300;
        margin = {top: 30, right: 30, bottom: 30, left: 30};

        var svg = d3.select("#chart").append("svg")
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', '0 0 ' + width + ' ' + height)
            .attr("preserveAspectRatio", "xMinYMin")
        width = width - margin.left - margin.right,
        height = height - margin.top - margin.bottom;
        g = svg.append("g")
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        var domain_values = (data_more_than_100_percent) ? [0, 110] : [0, 100]

        var x = d3.scaleLinear()
            .domain(domain_values).nice()
            .rangeRound([0, width]);

        var bins = d3.histogram()
            .domain(x.domain())
            .thresholds(x.ticks(40))
            (bin_grades);

        var y = d3.scaleLinear()
            .domain([0, d3.max(bins, function (d) {
                return d.length;
            })]).nice()
            .range([height, 0]);

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
                .tickFormat(function (d) {
                    return d + "%"
                })
                .ticks(20, 's'));

        g.append("text")
            .attr("transform",
                "translate(" + (width / 2 - margin.left) + " ," +
                (height + 20) + ")")
            .attr("dy", ".8em")
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .text("(%) Grade");

        g.append("g")
            .call(d3.axisLeft(y));

        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", ".8em")
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .text("Number of students");

        var bar = g.selectAll(".bar")
            .data(bins)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function (d) {
                return "translate(" + x(d.x0) + "," + y(d.length) + ")";
            });

        bar.append("rect")
            .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
            .attr("height", function (d) {
                return height - y(d.length);
            });

        bar.append("text")
            .attr("y", 10)
            .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
            .attr("height", function (d) {
                return height - y(d.length) - 50;
            })
            .attr("text-anchor", "middle")
            .style("font-size", "10px")
            .text(function (d) {
                if (d.length == 0) {
                    return '';
                }
                return d.length
            });
        if(myscore!=null) {
            g.append('line')
                .attr('x1', x(myscore))
                .attr('y1', 0-margin.top)
                .attr('x2', x(myscore))
                .attr('y2', height)
                .attr('stroke', 'darkorange')
                .attr('stroke-width', '1')
                .style('cursor', 'pointer')
                .on("mouseover", function (d) {
                    tooltip.text(myscoreText);
                    return tooltip.style("visibility", "visible");
                })
                .on("mousemove", function () {
                    return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
                })
                .on("mouseout", function () {
                    return tooltip.style("visibility", "hidden")
                });
            g.append('text')
                .attr('text-anchor', 'middle')
                .attr("x", x(myscore) - margin.right)
                .attr("dx", '1em')
                .attr("y", 0-margin.top)
                .attr("dy", ".9em")
                .attr("class", "myGradeline")
                .text('MyGrade')

        // Line Tooltip showing users current grade
        var div = d3.select("body").append("div")
            .attr("class", "tooltips")
            .style("opacity", 0);

            var tooltip = d3.select("body")
                .append("div")
                .style("position", "absolute")
                .style("z-index", "10")
                .style("visibility", "hidden")
                .style("font-color", "black")
                .style("font-weight", "bold")
                .style("font-size", "15px")
                .style("cursor", "pointer")
                .text("a simple tooltip");
        }

        var gradeDetailsHtml =
            '<span>Number of students: <b>' + totalStudents + '</b></span><br>' +
            '<span>Average grade: <b>' + gradeAverage + '</b></span><br>';
        if(myscore==null) {
            gradeDetailsHtml += '<span><b>There are no grades yet for you in this course</b></span><br>';
        }
        var gradeInfo = d3.select(".grade-info").append("div")
            .attr("class", "grade-details")
            .html(gradeDetailsHtml);

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