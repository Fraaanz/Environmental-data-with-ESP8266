
var url_string = window.location.href;
var url = new URL(url_string);

var xDaysPast = url.searchParams.get("xDaysPast");
var leaveOut = url.searchParams.get("leaveOut");
var queryCol = url.searchParams.get("queryCol");

// Fallback data settigns
if (xDaysPast == null) { xDaysPast = 2; }
if (leaveOut == null) { leaveOut = 16; }
if (queryCol == null) { queryCol = 'value1'; };

// Define: What value is what

var calcMeanValues;
if
  (queryCol == 'value1') {
  var valueUnit = '°C'; var valueText = 'Temperatur';
  var compareUnit = 'value2'
  var showDewPoint = true;
} else if
  (queryCol == 'value2') {
  var valueUnit = '%'; var valueText = 'rel. Luftfeuchte';
} else if
  (queryCol == 'value3') {
  var valueUnit = 'db'; var valueText = 'Lärmemission'
  var calcMeanValues = true;
} /* else if 
(queryCol == 'value4') {
  valueUnit = 'hPa'; valueText = 'Luftdruck';
} */

selectElement('xDaysPast', xDaysPast)
selectElement('leaveOut', leaveOut);
selectElement('queryCol', queryCol);

//console.log(queryCol);

function selectElement(id, valueToSelect) {
  var element = document.getElementById(id);
  element.value = valueToSelect;
}

// Get location data
d3.json("get-location.php", function (error, data) {
  // console.log(data[0].location);
  var element = document.getElementById('sensorLocation');
  element.innerHTML += ' „' + data[0].location + '“';
});

// console.log("xDaysPast" + xDaysPast);
// console.log("leaveOut" + leaveOut);
// console.log("queryCol" + queryCol);

// Generate SVG //////////////////////////////////////////////////////////////////

var label = d3.select(".label");
// Set the dimensions of the canvas / graph
var margin = {
  top: 30,
  right: 20,
  bottom: 40,
  left: 40
},
  width = 1000 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// Parse the date / time
var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

// Set the ranges
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define the axes
var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5);

var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);

// Define the line
var valueline = d3.svg.line().interpolate("basis").x(function (d) {
  return x(d.reading_time);
}).y(function (d) {
  return y(d.value);
});

// Define the line
var valueline2 = d3.svg.line().interpolate("basis").x(function (d) {
  return x(d.reading_time);
}).y(function (d) {
  return y(d.value2);
});

// Adds the svg canvas
var svg = d3.select("body .svg-graph").append("svg").attr("viewBox", "0 0 " + (
  width + margin.left + margin.right
) + " " + (
    height + margin.top + margin.bottom
  )).attr("width", "100%").attr("height", "100%").append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

document.querySelector(".svg-graph").classList.add("loader");
document.querySelector(".current").classList.add("loadertext");

// Get the data //////////////////////////////////////////////////////////////////

var queryColSnippet = queryCol;
if (compareUnit) { queryColSnippet = queryCol + '%2C+' + compareUnit }

console.log("Query URL: get-data.php?xDaysPast=" + xDaysPast + "&leaveOut=" + leaveOut + "&queryCol=" + queryColSnippet);

d3.json("get-data.php?xDaysPast=" + xDaysPast + "&leaveOut=" + leaveOut + "&queryCol=" + queryColSnippet, function (error, data) {

  //console.log('reading_time 0 = ' + data[0].reading_time);
  //console.log('value1 0 = ' + data[0].value1);
  //console.log('value1 0 = ' + data[0].value2);

  if (showDewPoint == true) {
    document.getElementById("current-value-additional").innerHTML = "Taupunkt";
    // console.log(Math.round(dewPoint(parseInt(data[0].value1), parseInt(data[0].value2)) * 10) / 10);
    document.getElementById("current-value-additional-value").innerHTML = Math.round(dewPoint(parseInt(data[0].value1), parseInt(data[0].value2)) * 10) / 10 + "<span class='current-value-unit'>" + valueUnit + "<span>";
  }

  document.getElementById("current-value-text").innerHTML = valueText;

  document.getElementById("current-value").innerHTML = Math.round(data[0][queryCol] * 10) / 10 + "<span class='current-value-unit'>" + valueUnit + "<span>";

  if (calcMeanValues == true) {
    function length(obj) {
      return Object.keys(obj).length;
    }

    var i = 0;
    var calcValue;

    data.forEach(function (d) {
      d.reading_time = parseDate(d.reading_time);

      var meanData = parseInt(data[i][queryCol]);
      // console.log("meanData " + meanData);

      var meanAfter = meanData;
      for (var j = 0; j <= 20; j++) {

        var iAfter = i + j;
        if (i >= length(data) - j) {
          iAfter = length(data) - j;
        };
        meanAfter = meanAfter + parseInt(data[iAfter][queryCol]);
        // console.log("meanAfter " + j + "🎯 " + meanAfter);
      }
      meanData = (meanAfter / (j + 1));
      // console.log("meanData " + meanData);

      d.value = + meanData;
      i++;
    });
  }
  else {
    data.forEach(function (d) {
      d.reading_time = parseDate(d.reading_time);
      d.value = + d[queryCol];
      if (showDewPoint == true) {
        d.value2 = dewPoint(parseInt(d[queryCol]), parseInt(d[compareUnit]));
        console.log(d.value2);
      }
    });
  }

  // Scale the range of the data
  x.domain(d3.extent(data, function (d) {
    return d.reading_time;
  }));
  y.domain([
    0, d3.max(data, function (d) {
      return d.value;
    })
  ]);

  // Set the gradient

  var max = d3.max(data, function (d) { return +d.value; })

  svg.append("linearGradient")
    .attr("id", "line-gradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0)
    .attr("y1", y(0))
    .attr("x2", 0)
    .attr("y2", y(max))
    .selectAll("stop")
    .data([
      { offset: "30%", color: "#0044FF" },
      { offset: "100%", color: "#FF0044" }
    ])
    .enter().append("stop")
    .attr("offset", function (d) { return d.offset; })
    .attr("stop-color", function (d) { return d.color; });

  svg.append("path").attr("class", "line").attr("stroke", "url(#line-gradient)").attr("d", valueline(data));
  svg.append("path").attr("class", "line2").attr("stroke", "url(#line-gradient)").attr("d", valueline2(data));

  // Add the X Axis
  svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);

  // Add the Y Axis
  svg.append("g").attr("class", "y axis").call(yAxis);

  document.querySelector(".svg-graph").classList.remove("loader");
  document.querySelector(".current").classList.remove("loadertext");

});

// Taupunkt Berechnung
// THX to https://myscope.net/taupunkttemperatur/
function dewPoint(t, r) {
  // Konstante
  var mw = 18.016; // Molekulargewicht des Wasserdampfes (kg/kmol)
  var gk = 8214.3; // universelle Gaskonstante (J/(kmol*K))
  var t0 = 273.15; // Absolute Temperatur von 0 °C (Kelvin)
  var tk = t + t0; // Temperatur in Kelvin

  var a, b;
  if (t >= 0) {
    a = 7.5;
    b = 237.3;
  } else if (t < 0) {
    a = 7.6;
    b = 240.7;
  }

  // Sättigungsdampfdruck (hPa)
  var sdd = 6.1078 * Math.pow(10, (a * t) / (b + t));

  // Dampfdruck (hPa)
  var dd = sdd * (r / 100);

  // Wasserdampfdichte bzw. absolute Feuchte (g/m3)
  var af = Math.pow(10, 5) * mw / gk * dd / tk;

  // v-Parameter
  var v = Math.log10(dd / 6.1078);

  // Taupunkttemperatur (°C)
  var td = (b * v) / (a - v);
  return td;
}
