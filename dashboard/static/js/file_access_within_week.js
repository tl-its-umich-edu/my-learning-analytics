
var tooltip = d3.select("body").append("div").attr("class", "toolTip");


var makeGraph = function(url) {
    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 250
    };
    var width = 960 - margin.left - margin.right;
    var height = 800 - margin.top - margin.bottom;


    d3.selectAll("div#chart > *").remove();

    var svg = d3.select("div#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("overflow-y", "auto")
        .attr('preserveAspectRatio', 'xMinYMin')
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
        .range([0, width]);

    var y = d3.scaleBand()
        .range([height, 0]);

    var xAxis = d3.axisBottom(x)
        .ticks(10, "%");

    var yAxis = d3.axisLeft(y);

    $.getJSON(url || "/file_access_within_week?week_num=1", function ( initResult) {
        data = initResult;

        data.sort(function(a, b) { return a.total_count - b.total_count; });

        x.domain([0, d3.max(data, function (d) {
            return d.total_count;
        })]);

        y.domain(data.map(function (d) {
            return d.file_name;
        }))
            .paddingInner(0.1)
            .paddingOuter(0.5);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "translate(" + width + ",0)")
            .attr("y", -5)
            .style("text-anchor", "end")
            .text("Percentage");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("height", y.bandwidth())
            .attr("y", function (d) {
                return y(d.file_name);
            })
            .attr("width", function (d) {
                return x(d.total_count);
            })
            .attr("fill", function(d) {
                if (d.self_access_count > 0 ) {
                    return "steelblue";
                } else {
                    return "orange";
                }
            })
            .on("mouseover", function() { tooltip.style("display", null); })
            .on("mouseout", function() { tooltip.style("display", "none"); })
            .on("mousemove", function(d) {
                if (d.self_access_count > 0) {
                    self_string = "You have read the file " + d.self_access_count + " times. The last time you accessed this file was on " + new Date(d.self_access_last_time);
                } else {
                    self_string = "You haven't viewed this file. ";
                }
                tooltip
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("display", "inline-block")
                    .html("<b>" + d.total_count*100 + "% </b>of students have accessed <b>" + d.file_name + "</b>. " + self_string);
            });

    });

    function type(d) {
        d.total_count = +d.total_count;
        return d;
    }
};

$('#grade').change(function() {

    var grade = $('#grade').val();
    var slider_num=$('#slider_num').val();
    makeGraph('/file_access_within_week?week_num=' + slider_num + "&grade=" + grade);

});

var makeSlider = function() {

    var margin = {left: 30, right: 30},
        width = 860,
        height = 50,
        range = [1, 20],
        step = 1; // change the step and if null, it'll switch back to a normal slider

    // append svg
    var svg = d3.select('div#slider').append('svg')
        .attr('width', width)
        .attr('height', height);

    var slider = svg.append('g')
        .classed('slider', true)
        .attr('transform', 'translate(' + margin.left +', '+ (height/2) + ')');

    // using clamp here to avoid slider exceeding the range limits
    var xScale = d3.scaleLinear()
        .domain(range)
        .range([0, width - margin.left - margin.right])
        .clamp(true);

    // array useful for step sliders
    var rangeValues = d3.range(range[0], range[1], step || 1).concat(range[1]);
    var xAxis = d3.axisBottom(xScale).tickValues(rangeValues).tickFormat(function (d) {
        return d;
    });

    xScale.clamp(true);

    function dragged(value) {
        var x = xScale.invert(value), index = null, midPoint, cx, xVal;
        if(step) {
            // if step has a value, compute the midpoint based on range values and reposition the slider based on the mouse position
            for (var i = 0; i < rangeValues.length - 1; i++) {
                if (x >= rangeValues[i] && x <= rangeValues[i + 1]) {
                    index = i;
                    break;
                }
            }
            midPoint = (rangeValues[index] + rangeValues[index + 1]) / 2;
            if (x < midPoint) {
                cx = xScale(rangeValues[index]);
                xVal = rangeValues[index];
            } else {
                cx = xScale(rangeValues[index + 1]);
                xVal = rangeValues[index + 1];
            }
        } else {
            // if step is null or 0, return the drag value as is
            cx = xScale(x);
            xVal = x.toFixed(3);
        }
        // use xVal as drag value
        handle.attr('cx', cx);
        d3.selectAll("div#slider_label").nodes().map(function(d) { d.innerHTML = "View File Access Patterns in last " + xVal +" weeks:"; });

        // set the hidden value
        $('#slider_num').val(xVal);

        var grade = $('#grade').val();
        makeGraph('/file_access_within_week?week_num=' + xVal + "&grade=" + grade);
    }

    // drag behavior initialization
    var drag = d3.drag()
        .on('start.interrupt', function () {
            slider.interrupt();
        }).on('end', function () {
            dragged(d3.event.x);
        });

    // this is the main bar with a stroke (applied through CSS)
    var track = slider.append('line').attr('class', 'track')
        .attr('x1', xScale.range()[0])
        .attr('x2', xScale.range()[1]);

    // this is a bar (steelblue) that's inside the main "track" to make it look like a rect with a border
    var trackInset = d3.select(slider.node().appendChild(track.node().cloneNode())).attr('class', 'track-inset');

    var ticks = slider.append('g').attr('class', 'ticks').attr('transform', 'translate(0, 4)')
        .call(xAxis);

    // drag handle
    var handle = slider.append('circle').classed('handle', true)
        .attr('r', 8);

    // this is the bar on top of above tracks with stroke = transparent and on which the drag behaviour is actually called
    // try removing above 2 tracks and play around with the CSS for this track overlay, you'll see the difference
    var trackOverlay = d3.select(slider.node().appendChild(track.node().cloneNode())).attr('class', 'track-overlay')
        .call(drag);

    // initial transition
    slider.transition().duration(750)
        .tween("drag", function () {
            var i = d3.interpolate(0, 1);

            // init the slider_num
            $('#slider_num').val(1);

            return function (t) {
                // dragged(xScale(i(t)));
            };
        });
};

makeSlider();

makeGraph();