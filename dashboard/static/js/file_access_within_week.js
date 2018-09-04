
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
        mini_width,
        textScale;

    d3.selectAll("div#chart > *").remove();

    // Define the div for the tooltip
    var chartTooltip = d3.select("body").append("div")
        .attr("class", "tooltip");

    $.getJSON(url || "/file_access_within_week?week_num_start=1&week_num_end=0", function (initResult) {
        if (initResult.length == 0 )
        {
            // return no data
            return "no data";
        }
        data = initResult;

        data.sort(function(a, b) { return b.total_count - a.total_count; });

        /////////////////////////////////////////////////////////////
        ///////////////// Set-up SVG and wrappers ///////////////////
        /////////////////////////////////////////////////////////////

        //Added only for the mouse wheel
        var zoomer = d3.behavior.zoom()
            .on("zoom", null);

        var main_margin = {top: 10, right: 10, bottom: 30, left: 300},
            main_width = 1000 - main_margin.left - main_margin.right,
            main_height = 400 - main_margin.top - main_margin.bottom;

        var mini_margin = {top: 10, right: 10, bottom: 30, left: 10},
            mini_height = 400 - mini_margin.top - mini_margin.bottom;
        mini_width = 100 - mini_margin.left - mini_margin.right;

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
        d3.select(".mainGroupWrapper")
            .append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + 0 + "," + (main_height + 5) + ")");

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

        /////////////////////////////////////////////////////////////
        /////////////////////// Update scales ///////////////////////
        /////////////////////////////////////////////////////////////

        //Update the scales
        main_xScale.domain([0, d3.max(data, function(d) { return d.total_count; })]);
        mini_xScale.domain([0, d3.max(data, function(d) { return d.total_count; })]);
        main_yScale.domain(data.map(function(d) { return d.file_name; }));
        mini_yScale.domain(data.map(function(d) { return d.file_name; }));

        //Create the visual part of the y axis
        d3.select(".mainGroup").select(".y.axis").call(main_yAxis);

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

        brush = d3.svg.brush()
            .y(mini_yScale)
            .extent([mini_yScale(data[0].file_name), mini_yScale(data[brushExtent].file_name)])
            .on("brush", brushmove)
        //.on("brushend", brushend);
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
        ///////////////////////////////////////////////////////////////////////////
        /////////////////// Create a rainbow gradient - for fun ///////////////////
        ///////////////////////////////////////////////////////////////////////////

        defs = svg.append("defs")
        //Add the clip path for the main bar chart
        defs.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", -main_margin.left)
            .attr("width", main_width + main_margin.left)
            .attr("height", main_height);

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
    }); //init()

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
            .attr("y", function(d) {
                return main_yScale(d.file_name); })
            .attr("height", main_yScale.rangeBand())
            .attr("x", 0)
            .transition().duration(50)
            .attr("width", function(d) {
                return main_xScale(d.total_count); });
        bar.on("mousemove", function () {
            chartTooltip.style("display", null);
            })
            .on("mouseout", function () {
                chartTooltip.style("display", "none");
            })
            .on("mouseover", function (d) {
                if (d.self_access_count > 0) {
                    self_string = "You have read the file " + d.self_access_count + " times. The last time you accessed this file was on " + new Date(d.self_access_last_time);
                } else {
                    self_string = "You haven't viewed this file. ";
                }
                chartTooltip
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("display", "inline-block")
                    .html("<b>" + d.total_count * 100 + "% </b>of students have accessed <b>" + d.file_name + "</b>. " + self_string);
            });
        //EXIT
        bar.exit()
            .remove();

    }//update

    /////////////////////////////////////////////////////////////
    ////////////////////// Brush functions //////////////////////
    /////////////////////////////////////////////////////////////

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
                if (selected.indexOf(d.file_name) > -1) {
                    if (d.self_access_count > 0 ) {
                        return "steelblue";
                    } else {
                        return "orange";
                    }
                } else {
                    return "#e0e0e0";
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

};

var mySlider = new rSlider({
    target: '#slider',
    values: [8, 7, 6, 5, 4, 3, 2, 1, 0],
    range: true, // range slider
    set:    [1], // an array of preselected values
    width:    null,
    scale:    true,
    labels:   false,
    tooltip:  true,
    step:     1, // step size
    disabled: false, // is disabled?
    onChange:  function (values) {
        // argument values represents current values
        var grade = $('#grade').val();
        $("#slider_label").html("View File Access Patterns in last " + values[0] + " to " + values[2] + " weeks:");
        makeGrapBasedOnGradeAndSlide(grade, values);
    }
});

$('#grade').change(function() {

    makeGrapBasedOnGradeAndSlide($('#grade').val(), mySlider.getValue())

});

function makeGrapBasedOnGradeAndSlide(grade, silderValues)
{
    makeGraph('/file_access_within_week?week_num_start=' + silderValues[0] + "&week_num_end=" + silderValues[2] + "&grade=" + grade);
};

makeGraph();