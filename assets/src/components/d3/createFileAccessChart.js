import * as d3 from 'd3'
import { adjustViewport } from '../../util/chart'
import d3tip from 'd3-tip'
import './createFileAccessChart.css'

function createFileAccessChart ({ data, width, height, domElement }) {
    /*
            References:
                - https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172
                - http://bl.ocks.org/nbremer/326fb6de768e85261bfd47aa1f497863
                - D3 Brush: https://github.com/d3/d3-brush/blob/master/README.md#brushSelection
                - D3 V4 Changes: https://github.com/d3/d3/blob/master/CHANGES.md
        */ 
        
       const update = () => {
        let bar = d3.select(".mainGroup").selectAll(".bar")
            .data(fileData, d => d.file_name)
        
        // Initialize
        bar.attr("x", 0)
            .attr("y", d => main_yScale(d.file_name))
            .attr("width", d => main_xScale(d.total_count))
            .attr("height", main_yScale.bandwidth())

        bar
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", d => main_yScale(d.file_name))
            .attr("width", d => main_xScale(d.total_count))
            .attr("height", main_yScale.bandwidth())
            .attr("class", "bar")
            .attr("fill", d => d.self_access_count > 0 ? COLOR_ACCESSED_FILE : COLOR_NOT_ACCESSED_FILE)
            .on("mouseover", toolTip.show)
            .on("mouseout", toolTip.hide)
        
        // Append text to bars
        svg.selectAll(".label").remove() 
        let texts = svg.selectAll(".label")
            .data(fileData)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => main_xScale(d.total_count) + 3 + main_margin.left)
            .attr("y", d => main_yScale(d.file_name) + main_yScale.bandwidth() / 2 + main_margin.top)
            .attr("dx", -10 )
            .attr("dy", ".35em")
            .style("font-size", 10)
            .attr("text-anchor", "end")
            .text(d => (((main_yScale(d.file_name) + main_yScale.bandwidth()/2) < main_height) && ((main_yScale(d.file_name) + main_yScale.bandwidth()/2) > 0))? d.total_count:"")
        
        bar.exit().remove()
    }

    const brushmove = () => {
        let fullRange = main_yZoom.range()
        let selection = d3.event ? d3.event.selection: default_selection
        
        // Update the axes
        // Map selection area to full range
        main_yZoom.domain(selection)
        // Update the main domain
        main_yScale = d3.scaleBand()
            .range([main_yZoom(fullRange[0]), main_yZoom(fullRange[1])])
            .paddingInner(0.4)
            .paddingOuter(0)

        main_yScale.domain(fileData.map( d => d.file_name))

        // Update the y axis
        main_yAxis = d3.axisLeft(main_yScale).tickSize(0).tickFormat(d => d.split("|")[1])

        mainGroup.select(".axis--y").call(main_yAxis)

        // Updated style of selected bars
        let selected = mini_yScale.domain()
            .filter(d => selection[0] - mini_yScale.bandwidth() <= mini_yScale(d) && mini_yScale(d) <= selection[1])

        d3.select(".miniGroup").selectAll(".bar")
            .style("fill", d => d.self_access_count > 0 ? COLOR_ACCESSED_FILE : COLOR_NOT_ACCESSED_FILE)
            .style("opacity", d => selected.includes(d.file_name) ? "1" : "0.5")

        //Update the label size
        d3.selectAll(".axis--y text")
            .style("font-size", textScale(selected.length))

        // Update handles position
        // if (selection == null) {
        //     handles.attr("display", "none") 
        // } else {
        //     handles.attr("display", null).attr("transform", function(d, i) { return "translate(" + mini_width / 2 + "," +  selection[1] + ")"  }) 
        // }
        // Update the main bar chart
        update() 
    }

    const scroll = () => {
        // Mouse scroll on the chart
        let selection = d3.brushSelection(gBrush.node()) 
        let size = selection[1] - selection[0],
            range = mini_yScale.range(),
            y0 = d3.min(range),
            y1 = d3.max(range) + mini_yScale.bandwidth(),
            dy = d3.event.deltaY,
            topSection 
        
        if (selection[0] - dy < y0) { topSection = y0  }
        else if (selection[1] - dy > y1) { topSection = y1 - size  }
        else { topSection = selection[0] - dy  }

        // Make sure the page doesnt scroll
        d3.event.stopPropagation() 
        d3.event.preventDefault() 
        // Move the brush
        gBrush.call(brush.move, [topSection, topSection + size]) 
    }

    const brushcenter = () => {
        let target = d3.event.target,
            selection = d3.brushSelection(gBrush.node()),
            size = selection[1] - selection[0],
            range = mini_yScale.range(),
            y0 = d3.min(range) + size / 2,
            y1 = d3.max(range) + mini_yScale.bandwidth() - size / 2,
            center = Math.max( y0, Math.min( y1, d3.mouse(target)[1] ) ) 

        d3.event.stopPropagation() 
        gBrush.call(brush.move, [center - size / 2, center + size / 2]) 
    }
    
    let fileData = data 
    fileData.sort((a, b) => b.total_count - a.total_count)

    // colors used for different file states
    let COLOR_ACCESSED_FILE ="steelblue",
        COLOR_NOT_ACCESSED_FILE = "gray" 

    let default_selection = [0, 50]
    let main_margin = {top: 50, right: 10, bottom: 50, left: 200} 
    let [main_width, main_height] = adjustViewport(width, height, main_margin) 

    let mini_margin = {top: 50, right: 10, bottom: 50, left: 10},
        mini_width = 100 - mini_margin.left - mini_margin.right,
        mini_height = main_height 

    // Build the chart
    let svg = d3.select(domElement).append("svg")
        .attr("class", "svgWrapper")
        .attr("width", main_width + main_margin.left + main_margin.right + mini_width + mini_margin.left + mini_margin.right)
        .attr("height", main_height + main_margin.top + main_margin.bottom)
        .on("wheel.zoom", scroll)
        .on("mousedown.zoom", null) // Override the center selection
        .on("touchstart.zoom", null)
        .on("touchmove.zoom", null)
        .on("touchend.zoom", null)
    
    // Tooltip
    let toolTip = d3tip().attr("class", "d3-tip")
        .direction("n").offset([-5,5])
        .html(d => {
            let selfString
            if (d.self_access_count === 0) {
                selfString = "<b>You haven't viewed this file. </b>" 
            } else if (d.self_access_count === 1) {
                selfString = "You have read the file once on " + new Date(d.self_access_last_time).toDateString() + "." 
            } else {
                selfString = "You have read the file " + d.self_access_count + " times. The last time you accessed this file was on " + new Date(d.self_access_last_time).toDateString() + "." 
            }
            return selfString 
        })

    // Style tooltip
    svg.call(toolTip)
    

    // Main chart group
    let mainGroup = svg.append("g")
            .attr("class", "mainGroupWrapper")
            .attr("transform", "translate(" + main_margin.left + "," + main_margin.top + ")")
            .append("g")
            .attr("clip-path", "url(#clip)")
            .style("clip-path", "url(#clip)")
            .attr("class", "mainGroup")

    // Mini chart group
    let miniGroup = svg.append("g")
        .attr("class", "miniGroup")
        .attr("transform","translate(" + (main_margin.left + main_width + main_margin.right + mini_margin.left) + "," + mini_margin.top + ")") 
    
    let brushGroup = svg.append("g")
        .attr("class", "brushGroup")
        .attr("transform","translate(" + (main_margin.left + main_width + main_margin.right + mini_margin.left) + "," + mini_margin.top + ")") 

    // Scales
    let main_xScale = d3.scaleLinear().range([0, main_width]),
        mini_xScale = d3.scaleLinear().range([0, mini_width]),
        main_yScale = d3.scaleBand().range([0, main_height]),
        mini_yScale = d3.scaleBand().range([0, mini_height])
    let textScale = d3.scaleLinear().range([12,6]).domain([15,50]).clamp(true) 

    let main_yZoom = d3.scaleLinear().range([0, main_height])
        .domain([0, main_height]) 

    // Axis
    let main_xAxis = d3.axisBottom(main_xScale)
            .ticks(6)
            .tickSizeOuter(10),
        main_yAxis = d3.axisLeft(main_yScale)
            .tickSize(0)
            .tickFormat(d => d.split("|")[1])

        
    // Brush
    let brush = d3.brushY()
        .extent([[0, 0], [mini_width, mini_height]])
        .on("brush", brushmove)
        .handleSize(20) 

    let gBrush = brushGroup.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, default_selection)

    // Styling Brush
    gBrush.selectAll(".handle")
        .append("line")
        .attr("x2", mini_width)

    // Handles has to programmingly adjust location
    // let handles = gBrush.selectAll(".handle")
    //     .data([{type: "n"}, {type: "s"}])
    //     .enter()
    //     .append("line")
    //     .attr("x2", mini_width)
        
    // handles
    //     .data([{type: "n"}, {type: "s"}])
    //     .enter().append("path")
    //     .attr("class", "handle--custom")
    //     .attr("fill", "steelblue")
    //     .attr("d", d3.symbol().type(d3.symbolTriangle))
    //     .attr("transform", (d,i) => i ? "translate(" + (mini_width/2) + "," + 4 + ") rotate(180)" : "translate(" + (mini_width/2) + "," + -4 + ") rotate(0)") 
        

    gBrush.selectAll("rect")
        .attr("width", mini_width)

    // onClick center the brush
    gBrush
        .select(".overlay")
        .on("mousedown.brush", brushcenter)
        .on("touchstart.brush", brushcenter) 

    // Clips
    let defs = svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("x", - main_margin.left)
        .attr("width", main_width + main_margin.left)
        .attr("height", main_height)

    // Inject data
    // Domain
    main_xScale.domain([0, d3.max(fileData, d => d.total_count)])
    mini_xScale.domain([0, d3.max(fileData, d => d.total_count)])
    main_yScale.domain(fileData.map(d => d.file_name))
        .paddingInner(0.4)
        .paddingOuter(0) 
    mini_yScale.domain(fileData.map(d => d.file_name))
        .paddingInner(0.4)
        .paddingOuter(0)

    // Append axis to main chart
    let xLabel = d3.select(".mainGroupWrapper")
        .append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(" + 0 + "," + (main_height + 5)+ ")")
        .call(main_xAxis.tickFormat(d => d + "%"))
        
    xLabel.append("text")
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + main_width/2 + ", " + 40 + ")")
        .text("Percentage of All Students in the Selected Grade Range")
        .style("font-size", "14px") 
        
        
    let yLabel = mainGroup.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(-5,0)")
        .call(main_yAxis)
    
    yLabel.selectAll("text")
        .attr("fill", "steelblue")

    // Add links to file name
    d3.selectAll(".axis--y .tick").each(function(d) {
        // Have to use ES5 function to correctly use `this` keyword
        let link = d.split("|")[0] 
        let name = d.split("|")[1] 
        const a = d3.select(this.parentNode).append("a")
            .attr("xlink:target","_blank")
            .attr("xlink:href", link)
        a.node().appendChild(this) 
    })

    // Draw mini bars
    let mini_bar = miniGroup.selectAll(".bar")
        .data(fileData, d => d.file_name)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", d => mini_yScale(d.file_name))
        .attr("width", d => mini_xScale(d.total_count))
        .attr("height", mini_yScale.bandwidth())
        .attr("class", "bar")
        .attr("fill", d => d.self_access_count > 0 ? COLOR_ACCESSED_FILE : COLOR_NOT_ACCESSED_FILE)


    // Add brush to main chart
    miniGroup.append("g")
        .attr("class", "brush")
        .call(brush)

    // Legend
    let w = 800 - main_margin.left - main_margin.right,
        h = 600 - main_margin.top - main_margin.bottom,
        legend_box_length = 10,
        legend_box_text_interval = 15,
        legend_interval = 20,
        legend_y = -50 

    let legendLabels = [ ["Resources I haven't viewed", COLOR_NOT_ACCESSED_FILE],
        ["Resources I've viewed", COLOR_ACCESSED_FILE] ] 

    let legend = svg.select(".mainGroupWrapper").append("g")
        .attr("class", "legend")
        .attr('transform', `translate(-550, 0)`) 

    let legendRect = legend.selectAll('rect')
        .data(legendLabels)
        .enter()
        .append("rect")
        .attr("y", legend_y)
        .attr("width", legend_box_length)
        .attr("height", legend_box_length) 
        
    legendRect
        .attr("y", (d, i) => legend_y + i * legend_interval)
        .attr("x", w)
        .style("fill", d =>  d[1]) 

    let legendText = legend.selectAll('text')
        .data(legendLabels)
        .enter()
        .append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .attr("y", (d, i) => legend_y + i * legend_interval + legend_box_length)
        .attr("x", w + legend_box_text_interval)
        .text(d => d[0]) 

    brushmove()
}

export default createFileAccessChart 