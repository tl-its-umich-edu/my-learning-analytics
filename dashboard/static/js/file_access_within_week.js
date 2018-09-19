/////////////////////////////////////////////////////////////
///////////////// Set-up SVG and wrappers ///////////////////
/////////////////////////////////////////////////////////////

//Added only for the mouse wheel
var zoomer = d3.behavior.zoom()
    .on("zoom", null);

var main_margin = {top: 50, right: 10, bottom: 50, left: 300},
    main_width = 1000 - main_margin.left - main_margin.right,
    main_height = 400 - main_margin.top - main_margin.bottom;

var mini_margin = {top: 50, right: 10, bottom: 50, left: 10},
    mini_width = 100 - mini_margin.left - mini_margin.right,
    mini_height = 400 - mini_margin.top - mini_margin.bottom;

var makeGraph = function(url) {

    var data = [],
        svg,
        defs,
        gBrush,
        brush,
        main_xScale,
        mini_xScale,
        main_yScale,
        mini_yScale,
        main_yZoom,
        main_xAxis,
        main_yAxis,
        textScale;

    var padding = 100; // space around the chart, not including labels

    d3.selectAll("div#chart > *").remove();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            // split file link and file name
            var parts = d.file_name.split("|");
            if (d.self_access_count == 0) {
                self_string = "You haven't viewed this file. ";
            } else if (d.self_access_count == 1) {
                self_string = "You have read the file once on " + new Date(d.self_access_last_time);
            } else {
                self_string = "You have read the file " + d.self_access_count + " times. The last time you accessed this file was on " + new Date(d.self_access_last_time);

            }
            return self_string;
        })
    /////////////////////////////////////////////////////////////
    ////////////////////// Brush functions //////////////////////
    /////////////////////////////////////////////////////////////

    //Function runs on a brush move - to update the big bar chart
    function update() {

        /////////////////////////////////////////////////////////////
        ////////// Update the bars of the main bar chart ////////////
        /////////////////////////////////////////////////////////////

        //DATA JOIN
        var bar = d3.select(".mainGroup").selectAll(".bar")
            .data(data, function(d) { return d.file_name; });
        //UPDATE
        bar
            .attr("y", function(d) { return main_yScale(d.file_name); })
            .attr("height", main_yScale.rangeBand())
            .attr("x", 0)
            .transition().duration(50)
            .attr("width", function(d) { return main_xScale(d.total_count); });

        //ENTER
        bar.enter().append("rect")
            .attr("class", "bar")
            .attr("fill", function(d) {
                if (d.self_access_count > 0 ) {
                    return "steelblue";
                } else {
                    return "orange";
                }
            })
            .attr("y", function(d) { return main_yScale(d.file_name); })
            .attr("height", main_yScale.rangeBand())
            .attr("x", 0)
            .transition().duration(50)
            .attr("width", function(d) {
                return main_xScale(d.total_count); });

        // append text to bars
        svg.selectAll(".label").remove();
        var texts = svg.selectAll(".label")
            .data(data)
            .enter()
            .append("text");
        texts.attr("class", "label")
            .attr("x", function(d) { return main_xScale(d.total_count)+3 + main_margin.left; })
            .attr("y", function(d) { return main_yScale(d.file_name) + main_yScale.rangeBand()/2 + main_margin.top;})
            .attr("dx", -3)
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .text(function(d) { return d.total_count; });

        bar.on("mouseover", tip.show)
            .on("mouseout", tip.hide);

        //EXIT
        bar.exit()
            .remove();

    }//update

    //First function that runs on a brush move
    function brushmove() {
        var extent = brush.extent();

        //Which bars are still "selected"
        var selected = mini_yScale.domain()
            .filter(function(d) {
                return (extent[0] - mini_yScale.rangeBand() + 1e-2 <= mini_yScale(d)) && (mini_yScale(d) <= extent[1] - 1e-2); });
        //Update the colors of the mini chart - Make everything outside the brush grey
        d3.select(".miniGroup").selectAll(".bar")
            .style("fill", function(d, i) {
                if (d.self_access_count > 0 ) {
                    return "steelblue";
                } else {
                    return "orange";
                }
            })
            .style("opacity", function(d, i) {
                if (selected.indexOf(d.file_name) > -1) {
                    return "1";
                } else {
                    return "0.5";
                }
            });

        //Update the label size
        d3.selectAll(".y.axis text")
            .style("font-size", textScale(selected.length));

        /////////////////////////////////////////////////////////////
        ///////////////////// Update the axes ///////////////////////
        /////////////////////////////////////////////////////////////

        //Reset the part that is visible on the big chart
        var originalRange = main_yZoom.range();

        main_yZoom.domain( extent );

        //Update the domain of the x & y scale of the big bar chart
        main_yScale.domain(data.map(function(d) { return d.file_name; }));
        main_yScale.rangeBands( [ main_yZoom(originalRange[0]), main_yZoom(originalRange[1]) ], 0.4, 0);

        //Update the y axis of the big chart
        d3.select(".mainGroup")
            .select(".y.axis")
            .call(main_yAxis);

        //Find the new max of the bars to update the x scale
        var newMaxXScale = d3.max(data, function(d) { return selected.indexOf(d.file_name) > -1 ? d.total_count : 0; });
        main_xScale.domain([0, newMaxXScale]);

        //Update the x axis of the big chart
        d3.select(".mainGroupWrapper")
            .select(".x.axis")
            .transition().duration(50)
            .call(main_xAxis);

        //Update the big bar chart
        update();

    }//brushmove

    /////////////////////////////////////////////////////////////
    ////////////////////// Click functions //////////////////////
    /////////////////////////////////////////////////////////////

    //Based on http://bl.ocks.org/mbostock/6498000
    //What to do when the user clicks on another location along the brushable bar chart
    function brushcenter() {
        var target = d3.event.target,
            extent = brush.extent(),
            size = extent[1] - extent[0],
            range = mini_yScale.range(),
            y0 = d3.min(range) + size / 2,
            y1 = d3.max(range) + mini_yScale.rangeBand() - size / 2,
            center = Math.max( y0, Math.min( y1, d3.mouse(target)[1] ) );

        d3.event.stopPropagation();

        gBrush
            .call(brush.extent([center - size / 2, center + size / 2]))
            .call(brush.event);

    }//brushcenter

    /////////////////////////////////////////////////////////////
    ///////////////////// Scroll functions //////////////////////
    /////////////////////////////////////////////////////////////

    function scroll() {

        //Mouse scroll on the mini chart
        var extent = brush.extent(),
            size = extent[1] - extent[0],
            range = mini_yScale.range(),
            y0 = d3.min(range),
            y1 = d3.max(range) + mini_yScale.rangeBand(),
            dy = d3.event.deltaY,
            topSection;

        if ( extent[0] - dy < y0 ) { topSection = y0; }
        else if ( extent[1] - dy > y1 ) { topSection = y1 - size; }
        else { topSection = extent[0] - dy; }

        //Make sure the page doesn't scroll as well
        d3.event.stopPropagation();
        d3.event.preventDefault();

        gBrush
            .call(brush.extent([ topSection, topSection + size ]))
            .call(brush.event);

    }//scroll

    $.getJSON(url || "/file_access_within_week?week_num_start=1&week_num_end=0", function (initResult) {
        if (initResult.length === 0 )
        {
            // return no data
            return "no data";
        }
        data = initResult;

        data.sort(function(a, b) { return b.total_count - a.total_count; });

        svg = d3.select("div#chart").append("svg")
            .attr("class", "svgWrapper")
            .attr("width", main_width + main_margin.left + main_margin.right + mini_width + mini_margin.left + mini_margin.right)
            .attr("height", main_height + main_margin.top + main_margin.bottom)
            .call(zoomer)
            .on("wheel.zoom", scroll)
            //.on("mousewheel.zoom", scroll)
            //.on("DOMMouseScroll.zoom", scroll)
            //.on("MozMousePixelScroll.zoom", scroll)
            //Is this needed?
            .on("mousedown.zoom", null)
            .on("touchstart.zoom", null)
            .on("touchmove.zoom", null)
            .on("touchend.zoom", null);

        svg.call(tip);

        var mainGroup = svg.append("g")
            .attr("class","mainGroupWrapper")
            .attr("transform","translate(" + main_margin.left + "," + main_margin.top + ")")
            .append("g") //another one for the clip path - due to not wanting to clip the labels
            .attr("clip-path", "url(#clip)")
            .style("clip-path", "url(#clip)")
            .attr("class","mainGroup");

        var miniGroup = svg.append("g")
            .attr("class","miniGroup")
            .attr("transform","translate(" + (main_margin.left + main_width + main_margin.right + mini_margin.left) + "," + mini_margin.top + ")");

        var brushGroup = svg.append("g")
            .attr("class","brushGroup")
            .attr("transform","translate(" + (main_margin.left + main_width + main_margin.right + mini_margin.left) + "," + mini_margin.top + ")");

        /////////////////////////////////////////////////////////////
        ////////////////////// Initiate scales //////////////////////
        /////////////////////////////////////////////////////////////

        main_xScale = d3.scale.linear().range([0, main_width]);
        mini_xScale = d3.scale.linear().range([0, mini_width]);

        main_yScale = d3.scale.ordinal().rangeBands([0, main_height], 0.4, 0);
        mini_yScale = d3.scale.ordinal().rangeBands([0, mini_height], 0.4, 0);

        //Based on the idea from: http://stackoverflow.com/questions/21485339/d3-brushing-on-grouped-bar-chart
        main_yZoom = d3.scale.linear()
            .range([0, main_height])
            .domain([0, main_height]);

        //Create x axis object
        main_xAxis = d3.svg.axis()
            .scale(main_xScale)
            .orient("bottom")
            .ticks(4)
            //.tickSize(0)
            .outerTickSize(0);

        //Add group for the x axis
        var xAxisG = d3.select(".mainGroupWrapper")
            .append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + 0 + "," + main_height + ")");

        //Create y axis object
        main_yAxis = d3.svg.axis()
            .scale(main_yScale)
            .orient("left")
            .tickSize(0)
            .outerTickSize(0);

        //Add group for the y axis
        mainGroup.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(-5,0)");

        var half_width = main_width/2;
        var bottom_x_axis = (main_height+padding);

        mainGroup.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            //.attr("transform", "translate("+ half_width +","  + bottom_x_axis +")")  // centre below axis
            .attr("transform", "translate(300," + (main_height+35)+ ")")  // center below axis
            .text("Percentage of Students")
            .style("font-size", "14px");

        // now add titles to the axes
        /*mainGroup.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (- padding/2) +","+ 0 +")")  // text is drawn off the screen top left, move down and out and rotate
            .text("File Name")
            .style("font-size", "14px");*/

        /////////////////////////////////////////////////////////////
        /////////////////////// Update scales ///////////////////////
        /////////////////////////////////////////////////////////////

        //Update the scales
        main_xScale.domain([0, d3.max(data, function(d) { return d.total_count; })]);
        mini_xScale.domain([0, d3.max(data, function(d) { return d.total_count; })]);
        main_yScale.domain(data.map(function(d) { return d.file_name; }));
        mini_yScale.domain(data.map(function(d) { return d.file_name; }));

        //Create the visual part of the y axis
        d3.select(".mainGroup")
            .select(".y.axis")
            .call(main_yAxis)
            .selectAll("g")
            .append("svg:foreignObject");

        d3.selectAll(".y .tick text").each(function(d) {
            var parts = d.split("|");
            const a = d3.select(this.parentNode).append("a")
                .attr("xlink:href", parts[0])//change this for your function
                .style("fill", "steelblue");
            a.node().appendChild(this);
            d = parts[1];
        });

        // update the tick text
        main_yAxis.tickFormat(function(d) {
            var parts = d.split("|");
            return parts[1];
        });

        /////////////////////////////////////////////////////////////
        ///////////////////// Label axis scales /////////////////////
        /////////////////////////////////////////////////////////////

        textScale = d3.scale.linear()
            .domain([15,50])
            .range([12,6])
            .clamp(true);

        /////////////////////////////////////////////////////////////
        ///////////////////////// Create brush //////////////////////
        /////////////////////////////////////////////////////////////
        //What should the first extent of the brush become - a bit arbitrary this
        var brushExtent = Math.max( 1, Math.min( 20, Math.round(data.length*0.2) ) );
        if (data.length <=5) {
            // for small number of data, choose the whole range
            brushExtent = data.length -1;
        }


        brush = d3.svg.brush()
            .y(mini_yScale)
            .extent([mini_yScale(data[0].file_name), mini_yScale(data[brushExtent].file_name) + mini_yScale.rangeBand()])
            .on("brush", brushmove);
        //Set up the visual part of the brush
        gBrush = d3.select(".brushGroup").append("g")
            .attr("class", "brush")
            .call(brush);
        gBrush.selectAll(".resize")
            .append("line")
            .attr("x2", mini_width);
        gBrush.selectAll(".resize")
            .append("path")
            .attr("d", d3.svg.symbol().type("triangle-up").size(20))
            .attr("transform", function(d,i) {

                return i?"translate(" + (mini_width/2) + "," + 4 + ") rotate(180)" : "translate(" + (mini_width/2) + "," + -4 + ") rotate(0)";
            });
        gBrush.selectAll("rect")
            .attr("width", mini_width);
        //On a click recenter the brush window
        gBrush.select(".background")
            .on("mousedown.brush", brushcenter)
            .on("touchstart.brush", brushcenter);

        /////////////////////////////////////////////////////////////
        /////////////// Set-up the mini bar chart ///////////////////
        /////////////////////////////////////////////////////////////
        //The mini brushable bar
        //DATA JOIN
        var mini_bar = d3.select(".miniGroup").selectAll(".bar")
            .data(data, function(d) { return d.file_name; });
        //UDPATE
        mini_bar
            .attr("width", function(d) { return mini_xScale(d.total_count); })
            .attr("y", function(d) { return mini_yScale(d.file_name); })
            .attr("height", mini_yScale.rangeBand());

        //ENTER
        mini_bar.enter().append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("width", function(d) {
                return mini_xScale(Math.max(0, d.total_count)); })
            .attr("y", function(d) { return mini_yScale(d.file_name); })
            .attr("height", mini_yScale.rangeBand())
            .attr("fill", function(d) {
                if (d.self_access_count > 0 ) {
                    return "steelblue";
                } else {
                    return "orange";
                }
            });




        //EXIT
        mini_bar.exit()
            .remove();
        //Start the brush
        gBrush.call(brush.event);

        //////////////////////////////////
        // add legend
        var w = 550 - main_margin.left - main_margin.right,
            h = 350 - main_margin.top - main_margin.bottom,
            legend_box_length = 10,
            legend_box_text_interval = 15,
            legend_interval = 20,
            legend_y = -50;
        var colors =	[ ["Files I haven't viewed", "orange"],
            ["Files I've viewed", "steelblue"] ];
        var legend = svg.append("g")
            .attr("class", "legend")
            /*.attr("height", 100)
            .attr("width", 100)*/
            .attr('transform', 'translate(-100,50)');

        var legendRect = legend.selectAll('rect').data(colors);

        legendRect.enter()
            .append("rect")
            .attr("y", legend_y)
            .attr("width", legend_box_length)
            .attr("height", legend_box_length);

        legendRect
            .attr("y", function(d, i) { return legend_y + i * legend_interval;})
            .attr("x", w)
            .style("fill", function(d) {
                return d[1];
            });

        var legendText = legend.selectAll('text').data(colors);
        legendText.enter()
            .append("text")
        legendText
            .attr("font-family", "sans-serif")
            .attr("font-size", "14px")
            .attr("y", function(d, i) { return legend_y + i * legend_interval + legend_box_length;})
            .attr("x", w + legend_box_text_interval)
            .text(function(d) {
                return d[0];
            });
    });

};

var CURRENT_WEEK_PREFIX = "Now - Week ";
var WEEK_PREFIX = "Week ";

function cleanWeekInputNum(weekNumString)
{
    // get rid of "Now - Week " or "Week " substring
    // return only the week integer number
    var value = weekNumString.replace(CURRENT_WEEK_PREFIX, "");
    value = value.replace(WEEK_PREFIX, "");
    return value;
}

function makeGrapBasedOnGradeAndSlide(grade, silderValues)
{
    // parse to get start and end week number
    var startWeek = cleanWeekInputNum(silderValues[0]);
    var endWeek = cleanWeekInputNum(silderValues[1]);
    makeGraph('/file_access_within_week?week_num_start=' + startWeek + "&week_num_end=" + endWeek + "&grade=" + grade);
}

var mySlider;
var makeSlider;
makeSlider = function () {
    var TOTAL_WEEKS = 16;

    // default to be the first week
    var currentWeeKNumber = 1;

    $.getJSON("/get_current_week_number", function (initResult) {
        if (initResult.length === 0) {
            // return no data
            return "no data";
        }
        currentWeeKNumber = initResult.currentWeekNumber;
        // start week defaults to be two weeks ago
        var twoWeeksBeforeCurrentWeek = WEEK_PREFIX + Math.max(0, currentWeeKNumber-2)

        var i;
        var weekArray = [];
        var currentWeek ="Week 2";
        for (i = 1; i < TOTAL_WEEKS; i++) {
            if (i === currentWeeKNumber) {
                currentWeek = CURRENT_WEEK_PREFIX + i;
                weekArray.push(currentWeek);
            }
            else {
                weekArray.push(WEEK_PREFIX + i);
            }
        }

        mySlider = new rSlider({
            target: '#slider',
            values: weekArray,
            range: true, // range slider
            set: [twoWeeksBeforeCurrentWeek, currentWeek], // an array of preselected values
            scale: true,
            tooltip: false,
            onChange: function (values) {
                var valuesParts = values.split(",");
                // argument values represents current values
                var grade = $('#grade').val();
                $("#slider_label").html(" students from <b>" + valuesParts[0] + "</b> to <b>" + valuesParts[1] + "</b>");
                makeGrapBasedOnGradeAndSlide(grade, valuesParts);
            }
        });
    });
};

$('#grade').change(function() {
    // make new graph based on the grade selection
    var sliderValues = mySlider.getValue().split(",");
    makeGrapBasedOnGradeAndSlide($('#grade').val(), sliderValues);

});

makeSlider();

makeGraph();