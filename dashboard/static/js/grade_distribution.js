let makeGraph = function () {
    $.getJSON("/api/v1/courses/"+dashboard.course_id+"/grade_distribution", function (initResult) {
        let data = initResult;
        if(_.isEmpty(data)){
            d3.select("#chart").append("div")
                .attr("class", "alert alert-info")
                .attr("role","alert")
                .style("font-size", "20px")
                .style("font-weight", "bold")
                .html('No data for the view')
            return;
        }
        // over all course statistics
        let singleDataPoint = data[0];
        let totalStudents = singleDataPoint.tot_students;
        let gradeAverage = singleDataPoint.grade_avg;
        let myscore=singleDataPoint.current_user_grade
        let myscoreText= singleDataPoint.current_user_grade+"%"

        // get the current grade
        let bin_grades = [];
        let get_domain_upper_limit=singleDataPoint.graph_upper_limit;
        data.forEach(function (e) {
            bin_grades.push(e.current_grade)
        })

        let width = 1000,
            height = 300;
        let margin = {top: 30, right: 30, bottom: 30, left: 30};

        let svg = d3.select("#chart").append("svg")
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', '0 0 ' + width + ' ' + height)
            .attr("preserveAspectRatio", "xMinYMin")
        width = width - margin.left - margin.right,
        height = height - margin.top - margin.bottom;
        let g = svg.append("g")
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        let domain_values = [0,get_domain_upper_limit]

        let x = d3.scaleLinear()
            .domain(domain_values).nice()
            .rangeRound([0, width]);

        let bins = d3.histogram()
            .domain(x.domain())
            .thresholds(x.ticks(40))(bin_grades);

        let y = d3.scaleLinear()
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

        let bar = g.selectAll(".bar")
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
        d3.select("body").append("div")
            .attr("class", "tooltips")
            .style("opacity", 0);

            let tooltip = d3.select("body")
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

        let gradeDetailsHtml =
            '<span>Number of students: <b>' + totalStudents + '</b></span><br>' +
            '<span>Average grade: <b>' + gradeAverage + '</b></span><br>';
        if(myscore==null) {
            gradeDetailsHtml += '<span><b>There are no grades yet for you in this course</b></span><br>';
        }
        d3.select(".grade-info").append("div")
            .attr("class", "grade-details")
            .html(gradeDetailsHtml);

    }).fail(function() {
        d3.select(".error").append("div")
            .attr("class", "alert alert-danger")
            .attr("role","alert")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .html('Some error has occurred please try later or refresh the browser')
    });

};
makeGraph();