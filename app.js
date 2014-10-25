// pre-render d3 charts at server side
var d3 = require('d3'),
    jsdom = require('jsdom'),
    fs = require('fs'),
    htmlStub = '<html><head></head><style>body {font: 10px sans-serif;}.axis path,.axis line {fill: none;stroke: #000;shape-rendering: crispEdges;}.area {fill: steelblue;}</style><body><div id="dataviz-container"></div><script src="js/d3.min.js"></script></body></html>'

jsdom.env({
    features: {
        QuerySelector: true
    },
    html: htmlStub,
    done: function (errors, window) {
        // this callback function pre-renders the dataviz inside the html document, then export result into a static file
        
        var el = window.document.querySelector('#dataviz-container'),
            body = window.document.querySelector('body'),
            circleId = 'a2324' // say, this value was dynamically retrieved from some database


        var margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 50
        },
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var parseDate = d3.time.format("%d-%b-%y").parse;

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var area = d3.svg.area()
            .x(function (d) {
                return x(d.date);
            })
            .y0(height)
            .y1(function (d) {
                return y(d.close);
            });

        var svg = d3.select(el).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        

        fs.readFile('./data/data.tsv', 'utf8', function (err, data) {
            
            var parsed = d3.tsv.parse(data);            
                        
            parsed.forEach(function (d) {
                d.date = parseDate(d.date);
                d.close = +d.close;
            });

            x.domain(d3.extent(parsed, function (d) {
                return d.date;
            }));
            y.domain([0, d3.max(parsed, function (d) {
                return d.close;
            })]);

            svg.append("path")
                .datum(parsed)
                .attr("class", "area")
                .attr("d", area);
            

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Price ($)");
            
            var svgsrc = window.document.querySelector('html').innerHTML;

            fs.writeFile('index.html', svgsrc, function (err) {
                if (err) {
                    console.log('error saving document', err)
                } else {
                    console.log('The file was saved!')
                }
            });
        });
        

            // generate the dataviz
        /*
        d3.select(el)
            .append('svg:svg')
            .attr('width', 600)
            .attr('height', 300)
            .append('circle')
            .attr('cx', 300)
            .attr('cy', 150)
            .attr('r', 30)
            .attr('fill', '#26963c')
            .attr('id', circleId) // say, this value was dynamically retrieved from some database*/

        // make the client-side script manipulate the circle at client side)
        // var clientScript = "d3.select('#" + circleId + "').transition().delay(1000).attr('fill', '#f9af26')"

        /*
        d3.select(body)
            .append('script')
            .html(clientScript)*/

        // save result in an html file, we could also keep it in memory, or export the interesting fragment into a database for later use
        
    } // end jsDom done callback
});
// no semi-column was harmed during this development