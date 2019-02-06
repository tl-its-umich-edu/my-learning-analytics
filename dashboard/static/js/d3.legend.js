// Courtesy:http://bl.ocks.org/ZJONSSON/3918369, with tweeks for having Legend title
(function() {
    d3.legend = function(g) {
        g.each(function() {
            let g= d3.select(this),
                items = {},
                svg = d3.select(g.property("nearestViewportElement")),
                legendPadding = g.attr("data-style-padding") || 5,
                legendTitle = g.attr("data-legend-title"),
                lb = g.selectAll(".legend-box").data([true]),
                li = g.selectAll(".legend-items").data([true])
            lb.enter().append("g").classed("legend-box",true)
            li.enter().append("g").classed("legend-items",true)

            svg.selectAll("[data-legend]").each(function() {
                let self = d3.select(this)
                items[self.attr("data-legend")] = {
                    pos : self.attr("data-legend-pos") || this.getBBox().y,
                    color : self.attr("data-legend-color") != undefined ? self.attr("data-legend-color") : self.style("fill") != 'none' ? self.style("fill") : self.style("stroke")
                }
            })

            items = d3.entries(items).sort(function(a,b) { return a.value.pos-b.value.pos})


            li.selectAll("text")
                .data(items,function(d) { return d.key})
                .call(function(d) { d.enter().append("text")})
                .call(function(d) { d.exit().remove()})
                .attr("y",function(d,i) { return i+"em"})
                .attr("x","1em")
                .text(function(d) { return d.key})

            li.selectAll("circle")
                .data(items,function(d) { return d.key})
                .call(function(d) { d.enter().append("circle")})
                .call(function(d) { d.exit().remove()})
                .attr("cy",function(d,i) { return i-0.25+"em"})
                .attr("cx",0)
                .attr("r","0.4em")
                .style("fill",function(d) { (d.value.color);return d.value.color})

            // Reposition and resize the box
            let lbbox = li[0][0].getBBox()
            lb.append("rect")
                .attr("x",(lbbox.x-legendPadding))
                .attr("y",(lbbox.y-legendPadding))
                .attr("height",(lbbox.height+2*legendPadding))
                .attr("width",(lbbox.width+2*legendPadding))
            lb.append("text")
                .attr("class","legend-title")
                .attr("x",(lbbox.x+(legendPadding)))
                .attr("y",(lbbox.y-(2*legendPadding)))
                .text(legendTitle)


        })
        return g
    }
})()