var highlightData = function(fileName) {
    $('.bar').css("opacity", "1");
    $('.bar').not("." + fileName).css("opacity", ".2")
};

var makeGraph = function(url) {
    d3.selectAll("#chart > *").remove();
    $.getJSON(url ||  "/file_access_within_week/", function(initResult) {
        var data = initResult;
        var margin = {
                top: 40,
                right: 20,
                bottom: 30,
                left: 40
            },
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var color = d3.scale.category10();
        var colorColumn = "grade";
        // legend
        var activeLink = "0"; //to control legend selections and hover
        var legendClicked; //to control legend selections
        var legendClassArray = []; //store legend classes to select bars in plotSingle()

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);
        var y = d3.scale.linear()
            .range([height, 0]);
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");
        var tip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-10, 0])
            .html(function(d) {
                return "<div><strong>Percent:</strong> <span style=\"color:red\">" + d.percent + "</span></div><p>" + d.file_name + "</p><p>Grade: "+ d.grade + "</p><p>";
            })
        var svg = d3.select("#chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("style", 'padding-bottom:400px')
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.call(tip);

        //d3.json("data.json", function(error, data) {
        var files = _.uniq(_.pluck(data, "file_name"));
        var fileCount = [];
        _.each(files, function(file) {
            fileCount.push({
                "file": file,
                "count": 0
            });
        })
        _.each(data, function(item) {
            var corr = _.findWhere(fileCount, {
                file: item.file_name
            });
            corr.count = corr.count + 1;
        });
        _.each(data, function(item) {
            var corr = _.findWhere(fileCount, {
                file: item.file_name
            });
            item.count = corr.count;
        });


        x.domain(data.map(function(d) {
            return d.file_name;
        }));
        y.domain([0, d3.max(data, function(d) {
            return d.percent;
        })]);
        color.domain(data.map(function (d){ return d[colorColumn]; }));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style("width", "500px")
            .style("text-anchor", "end")
            .attr("dx", ".71em")
            .style("text-anchor", "end");
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 2)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Percentage");

        // Copy-on-write since tweens are evaluated after a delay.
        var x0 = x.domain(data.sort(function(a, b) { return b.percent - a.percent; })
            .map(function(d) { return d.file_name; }))
            .copy();

        var bar = svg.selectAll(".bar")
            .data(data)
            .sort(function(a, b) { return x0(a.letter) - x0(b.letter); })
            .enter().append("rect")
            .attr("class", function(d) {
                return "bar " + d.file_name.replace(/ /gi, "_") + " Percent:" + d.count  + " for Grade:" + d.grade;
            })
            .attr("x", function(d) {
                return x(d.file_name);
            })
            .attr("width", x.rangeBand())
            .attr("y", function(d) {
                return y(d.percent);
            })
            .attr("height", function(d) {
                return height - y(d.percent);
            })
            .attr("fill", function (d){ return color(d[colorColumn]); })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .on('click', function(d) {
                highlightData(d.file_name.replace(/ /gi, "_"));
            })
            .sort(function(a, b) { return x0(a.percent) - x0(b.percent); });

        svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .selectAll(".textlabel")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "textlabel")
            .attr("x", function(d) {
                 return x(d.file_name);
            })
            .attr("y", function(d) {
                return y(d.percent);
            })
            .text(function(d) {
                return d.count;
            });

        var legend = svg.selectAll(".legend")
            .data(color.domain().slice().reverse())
            .enter().append("g")
            //.attr("class", "legend")
            .attr("class", function (d) {
                legendClassArray.push(d.replace(/\s/g, '')); //remove spaces
                return "legend";
            })
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        //reverse order to match order in which bars are stacked
        legendClassArray = legendClassArray.reverse();

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color)
            .attr("id", function (d, i) {
                return "id" + d.replace(/\s/g, '');
            })
            .on("mouseover",function(){

                if (activeLink === "0") d3.select(this).style("cursor", "pointer");
                else {
                    if (activeLink.split("class").pop() === this.id.split("id").pop()) {
                        d3.select(this).style("cursor", "pointer");
                    } else d3.select(this).style("cursor", "auto");
                }
            })
            .on("click",function(d){

                if (activeLink === "0") { //nothing selected, turn on this selection
                    d3.select(this)
                        .style("stroke", "black")
                        .style("stroke-width", 2);

                    activeLink = this.id.split("id").pop();
                    plotSingle(this);

                    //gray out the others
                    for (i = 0; i < legendClassArray.length; i++) {
                        if (legendClassArray[i] != activeLink) {
                            d3.select("#id" + legendClassArray[i])
                                .style("opacity", 0.5);
                        }
                    }

                } else { //deactivate
                    if (activeLink === this.id.split("id").pop()) {//active square selected; turn it OFF
                        d3.select(this)
                            .style("stroke", "none");

                        activeLink = "0"; //reset

                        //restore remaining boxes to normal opacity
                        for (i = 0; i < legendClassArray.length; i++) {
                            d3.select("#id" + legendClassArray[i])
                                .style("opacity", 1);
                        }

                        //restore plot to original
                        restorePlot(d);

                    }

                } //end activeLink check


            });

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d; });

        function restorePlot(d) {

            state.selectAll("rect").forEach(function (d, i) {
                //restore shifted bars to original posn
                d3.select(d[idx])
                    .transition()
                    .duration(1000)
                    .attr("y", y_orig[i]);
            })

            //restore opacity of erased bars
            for (i = 0; i < legendClassArray.length; i++) {
                if (legendClassArray[i] != class_keep) {
                    d3.selectAll(".class" + legendClassArray[i])
                        .transition()
                        .duration(1000)
                        .delay(750)
                        .style("opacity", 1);
                }
            }

        }

        function plotSingle(d) {

            class_keep = d.id.split("id").pop();
            idx = legendClassArray.indexOf(class_keep);

            //erase all but selected bars by setting opacity to 0
            for (i = 0; i < legendClassArray.length; i++) {
                if (legendClassArray[i] != class_keep) {
                    d3.selectAll(".class" + legendClassArray[i])
                        .transition()
                        .duration(1000)
                        .style("opacity", 0);
                }
            }

            //lower the bars to start on x-axis
            y_orig = [];
            bar.selectAll("rect").forEach(function (d, i) {

                //get height and y posn of base bar and selected bar
                h_keep = d3.select(d[idx]).attr("height");
                y_keep = d3.select(d[idx]).attr("y");
                //store y_base in array to restore plot
                y_orig.push(y_keep);

                h_base = d3.select(d[0]).attr("height");
                y_base = d3.select(d[0]).attr("y");

                h_shift = h_keep - h_base;
                y_new = y_base - h_shift;

                //reposition selected bars
                d3.select(d[idx])
                    .transition()
                    .ease("bounce")
                    .duration(1000)
                    .delay(750)
                    .attr("y", y_new);

            })

        }

    });
};
$('select').on("change", function() {
    makeGraph(this.value);
});
makeGraph();