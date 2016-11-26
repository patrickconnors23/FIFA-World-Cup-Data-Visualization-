
// SVG drawing area

var margin = {top: 40, right: 40, bottom: 60, left: 60};

var width = 600 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var padding = 20;


// Date parser (https://github.com/mbostock/d3/wiki/Time-Formatting)
var formatDate = d3.time.format("%Y");


// Initialize data
loadData();

// FIFA world cup
var data;


// Load CSV file
function loadData() {
	d3.csv("data/fifa-world-cup.csv", function(error, csv) {

		csv.forEach(function(d){
			// Convert string to 'date object'
			d.YEAR = formatDate.parse(d.YEAR);
			d.YEAR =+ formatDate(d.YEAR);

			// Convert numeric values to 'numbers'
			d.TEAMS = +d.TEAMS;
			d.MATCHES = +d.MATCHES;
			d.GOALS = +d.GOALS;
			d.AVERAGE_GOALS = +d.AVERAGE_GOALS;
			d.AVERAGE_ATTENDANCE = +d.AVERAGE_ATTENDANCE;
		});

		// Store csv data in global variable
		data = csv;

		// Draw the visualization for the first time
		updateVisualization("GOALS",1900,2020,0);
	});
}



// Render visualization
function updateVisualization(selectedValue,min_bound,max_bound,setT) {

	min_bound =+min_bound;
	max_bound =+max_bound;

	var format = d3.format("0,000");

	var filtered_data = data.filter(function (value,index) {
		return (value.YEAR > min_bound && value.YEAR < max_bound);
	});

	filtered_data.sort(function (a,b) {
		return a.YEAR - b.YEAR;
	});

	var x_min = d3.min(filtered_data,function (d) {return d.YEAR;});
	var x_max = d3.max(filtered_data,function (d) {return d.YEAR;});

	var x = d3.scale.linear()
		.range([0, width]);

	var y = d3.scale.linear()
		.range([height,0]);

	var	valueline = d3.svg.line();

	x.domain([x_min,x_max]);

	valueline.x(function(d) {
		return x(d.YEAR);
	});

	var circles = svg.selectAll("circle")
		.data(filtered_data)

	circles.exit().remove();

	circles.enter()
		.append("circle")
		.attr("r",7)
		.attr("fill","#4ccead");

		var tip = d3.tip()
		  .attr('class', 'd3-tip')
		  .offset([-10, 0])
		  .html(function(d) {
		    return "<span>"+d.EDITION +"</span>"+"<p>" + d.GOALS + "</p>";
		  });

		svg.call(tip);

		y.domain([0,
			d3.max(filtered_data,function (d) {
				return d[selectedValue];
			})
		]);

		valueline.y(function(d) {
			return y(d[selectedValue]);
		});

		circles
			.transition()
			.duration(700)
			.attr("cy",function (d) {
				return y(d[selectedValue]);
			})
			.attr("cx",function (d) {
				return x(d.YEAR);
			});
		circles
			.on("click",function (d) {
				showEdition([d.EDITION,d.WINNER,d.GOALS,d.AVERAGE_GOALS,d.MATCHES,format(d.AVERAGE_ATTENDANCE)]);
			})
			.on("mouseover", tip.show)
			.on("mouseout", tip.hide);

		tip.html(function(d) {
			if (selectedValue == "AVERAGE_ATTENDANCE") {
				return "<span>"+d.EDITION +"</span>"+"<p>"+selectedValue+": "+ format(d[selectedValue]) + "</p>";
			} else {
				return "<span>"+d.EDITION +"</span>"+"<p>"+selectedValue+": "+ d[selectedValue] + "</p>";
			}
		});

		var xAxis = d3.svg.axis()
			.scale(x)
			.tickFormat(d3.format("d"))
			.ticks(9)
			.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");

		var yAxisGroup = svg.append("g")
			.attr("class", "y-axis axis");

		var xAxisGroup = svg.append("g")
			.attr("class", "x-axis axis")
			.attr("transform", "translate(0,"+height+")");

		svg.select(".y-axis")
			.transition()
			.duration(800)
			.call(yAxis);

		svg.select(".x-axis")
			.transition()
			.duration(800)
			.call(xAxis);

		svg.selectAll('.line').remove();

		window.setTimeout(appendLine,setT);

		function appendLine() {
			var path = svg.append("path")
				.attr("interpolate","linear")
				.attr("class", "line")
				.style("stroke","#4ccead")
				.transition()
				.duration(800)
				.attr("d", valueline(filtered_data));
		}

}

function selector() {
	var selectBox = document.getElementById("data-type");
	var selectedValue= selectBox.options[selectBox.selectedIndex].value;
	var min = $("#min").val();
	var max = $("#max").val();

	if (min == "" || max == "") {
		return updateVisualization(selectedValue,"1900","2020",550);
	} else {
		return updateVisualization(selectedValue,min,max,550);
	}
}
// Show details for a specific FIFA World Cup
function showEdition(d){
	$("#tournament-name").text(d[0]);
  $("#winner").text(d[1]);
	$("#goals").text(d[2]);
  $("#average-goals").text(d[3]);
  $("#matches").text(d[4]);
  $("#average-attendance").text(d[5]);
}
