var makeGraph = function () {
    d3.selectAll("#chart > *").remove();
    $.getJSON("/assignment_progress", function (initResult) {
        data = initResult;
        if(_.isEmpty(data)){
            var gradeInfo = d3.select("#chart").append("div")
                .attr("class", "alert alert-info")
                .attr("role","alert")
                .style("font-size", "20px")
                .style("font-weight", "bold")
                .html('No data for the view')
            return
        }

        var tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

        var width = 1500,
            height = 100;

        var margin = {
            top: 10,
            right: 30,
            bottom: 30,
            left: 30
        };

        var svg = d3.select("#chart").append("svg")
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', '0 0 ' + width + ' ' + height)
            .attr("preserveAspectRatio", "xMinYMin")
            .append('g');

        width = width - margin.left - margin.right,
        height = height - margin.top - margin.bottom;

        svg.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // Create x and y scale.

        var xScale = d3.scaleLinear()
            .range([0, width]);

        var yScale = d3.scaleBand()
            .range([0, height]);

        xScale.domain([0, 100]);

        var x_axis = svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + 0 + ',' + height + ')')
            .call(d3.axisBottom(xScale)
                .tickFormat(function(d) {
                    return d+"%"
                })
                .ticks(20, 's'))


        perc_so_far = 0;
        dperc_so_far = 0;
        //
        var bar = svg.selectAll(null)
            .data(data)
            .enter().append("g")

        bar.append("rect")
            .attr("width", function(d) {
                var prev_perc = perc_so_far;
                var this_perc = d.percent_gotten;
                perc_so_far = perc_so_far + this_perc;
                return xScale(perc_so_far) - xScale(prev_perc)
            })
            .attr("x", function(d) {
                var dprev_perc = dperc_so_far;
                var dthis_perc = d.percent_gotten;
                dperc_so_far = dperc_so_far + dthis_perc;
                return (xScale(dprev_perc)) ;
            })
            .attr("height",  yScale.bandwidth())
            .on("mouseover", function(d) {
                d3.select(this).attr("class", function(d){
                    //programming hack to reduce the flickering effect
                    return (d.graded===true)? "progress-hover-graded":"progress-hover-notgraded";
                });
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                var coordinates = d3.mouse(this);
                if ((width - coordinates[0]) < 50) {
                    tooltip.html("Assignment: <b>" + (d.name) + "</b><br>" +
                        "Due at: <b>" + (d.due_date_mod) + "</b><br>" +
                        "Your grade is: <b>" + ((!d.score) ? "Not available" : (d.score)) + "</b><br>" +
                        "Total Points Possible: <b>" + (d.points_possible) + "</b><br>" +
                        "Percentage worth in final grade: <b>" + (d.towards_final_grade) + "%</b><br>" +
                        ((d.drop_lowest != 0) ? "The lowest <b>" + d.drop_lowest + "</b> scores will dropped from this assignment group" : '') +
                        ((d.drop_highest != 0) ? "The highest <b>" + d.drop_highest + "</b> scores will dropped from this assignment group" : ''))
                        .style("left", (d3.event.pageX)-(d3.event.pageY*2) + "px")
                        .style("top", (d3.event.pageY)-150 + "px");

                } else {
                    tooltip.html("Assignment: <b>" + (d.name) + "</b><br>" +
                        "Due at: <b>" + (d.due_date_mod) + "</b><br>" +
                        "Your grade is: <b>" + ((!d.score) ? "Not available" : (d.score)) + "</b><br>" +
                        "Total Points Possible: <b>" + (d.points_possible) + "</b><br>" +
                        "Percentage worth in final grade: <b>" + (d.towards_final_grade) + "%</b><br>" +
                        ((d.drop_lowest != 0) ? "The lowest <b>" + d.drop_lowest + "</b> scores will dropped from this assignment group" : '') +
                        ((d.drop_highest != 0) ? "The highest <b>" + d.drop_highest + "</b> scores will dropped from this assignment group" : ''))
                        .style("left", (d3.event.pageX)+ "px")
                        .style("top", (d3.event.pageY) + "px");
                }
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
                d3.select(this).attr("class", function(d){
                    return (d.graded===true)? "progress-graded":"progress-nongraded";
                });
            })
            .attr("class",function(d){
                return (d.graded===true)? "progress-graded":"progress-nongraded";
            });

        perc_so_far = 0;
        let gradeIndicator = [...new Set(data.map(item => item.graded))];
        var currentWeekXValue=''
        var maxPossibleWeekXValue=''
        bar.append("text")
            .attr("x", function(d,i) {
                var dprev_perc = perc_so_far;
                var dthis_perc = d.percent_gotten;
                perc_so_far = perc_so_far + dthis_perc;
                xCoordinate=xScale(dprev_perc)
                if(gradeIndicator.length==2) {
                    if (d.graded) {
                        currentWeekXValue = xScale(perc_so_far);
                    }
                    if (data.length == i + 1) {
                        maxPossibleWeekXValue = xScale(perc_so_far);
                    }
                }
                if(gradeIndicator.length==1 && data.length == i + 1 ){
                    if(gradeIndicator[0]){
                        currentWeekXValue=xScale(perc_so_far);
                    }
                    if(!gradeIndicator[0]){
                        maxPossibleWeekXValue = xScale(perc_so_far);
                    }
                }
                return (xCoordinate)
            })
            .attr("dy", "2.4em")
            .attr("dx",".6em")
            .text(function(d,i) {
                if (parseFloat(d.percent_gotten) < 2.0) {
                    return "";
                }
                if (d.name.length > 5) {
                    return d.name.substring(0, 5) + '...';
                } else {
                    return d.name;
                }
            });
            if(currentWeekXValue.length!=0) {
                var currentLine = svg.append("g")
                currentLine.append('line')
                    .attr('x1', currentWeekXValue)
                    .attr('y1', 0)
                    .attr('x2', currentWeekXValue)
                    .attr('y2', height)
                    .attr('stroke', 'darkorange')
                    .attr('stroke-width', '1')
                currentLine.append('text')
                    .attr('text-anchor', 'middle')
                    .attr("x", currentWeekXValue - 30)
                    .attr("dx", '.1em')
                    .attr("y", ".1em")
                    .attr("dy", ".9em")
                    .attr('stroke', 'orange')
                    .attr("background-color", 'whitesmoke')
                    .text('Current')
            }
        if(maxPossibleWeekXValue.length!=0) {
            var maxLine = svg.append("g")
            maxLine.append('line')
                .attr('x1', maxPossibleWeekXValue)
                .attr('y1', 0)
                .attr('x2', maxPossibleWeekXValue)
                .attr('y2', height)
                .attr('stroke', 'green')
                .attr('stroke-width', '1')
            maxLine.append('text')
                .attr('text-anchor', 'middle')
                .attr("x", maxPossibleWeekXValue - 50)
                .attr("dx", '.1em')
                .attr("y", ".1em")
                .attr("dy", ".9em")
                .attr('stroke', 'green')
                .text('Max Possible')
        }

        // d3.select(window).on('resize', resize);
        // function resize () {
        //     var width = parseInt(d3.select("#chart").style("width"));
        // }

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
