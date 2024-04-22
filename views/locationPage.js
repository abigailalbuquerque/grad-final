function play( audio_path, time_in_milisec){
  let beep = new Audio(audio_path);
  beep.loop = true;
  beep.play();
  setTimeout(() => { beep.pause(); }, time_in_milisec);
}

window.onload = () => {
  console.log("new page load")
  const transition_el = document.querySelector('.transition');
  transition_el.classList.remove('is-active');
  setTimeout(() => {
      console.log("remove")
      transition_el.classList.remove('is-active');
      //play2('./sounds/windhowl.wav');//doesn't allow playing it onload
  }, 500);
}

document.getElementById('back').onclick = function () {
  console.log("clicked");
  location.href = "./index.html";
};

document.addEventListener('click', function (e) {
  play('./sounds/windhowl.wav', 5000);
})

var weather = [];
let currentDayIndex = 0;

function getWeatherGrid(lat, lng) {
  const apiUrl = "https://api.weather.gov/points/" + lat + "," + lng;
  console.log(apiUrl);
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      getWeatherData(data.properties.forecastHourly);
      return data.properties.forecastHourly;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function getWeatherData(url) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      for (let i = 0; i < 72; i++) {
        weather.push(data.properties.periods[i]);
      }
      console.log(weather);
      renderWeatherCharts(weather);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function renderWeatherCharts(weatherData) {
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = 400 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;

  const container = d3.select("#graphContainer");
  container.selectAll(".graph").remove();
  const parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S%Z");
  const formatTime = d3.timeFormat("%H:%M");
  const timestamps = weatherData.map((d) => parseTime(d.startTime));
  const temperatures = weatherData.map((d) => d.temperature);
  const windSpeeds = weatherData.map((d) => {
    let speed = d.windSpeed.match(/\d+/);
    return speed ? +speed[0] : 0;
  });

  const precipitationChances = weatherData.map(
    (d) => +d.probabilityOfPrecipitation
  );

  createChart(
    container,
    "Temperature Chart",
    temperatures,
    timestamps,
    formatTime,
    height,
    width,
    margin,
    "Temperature (°F)"
  );
  createChart(
    container,
    "Wind Speed Chart",
    windSpeeds,
    timestamps,
    formatTime,
    height,
    width,
    margin,
    "Wind Speed (km/h)"
  );
  createChart(
    container,
    "Precipitation Chart",
    precipitationChances,
    timestamps,
    formatTime,
    height,
    width,
    margin,
    "Chance of Precipitation (%)"
  );
}

function createChart(
  container,
  title,
  data,
  timestamps,
  formatTime,
  height,
  width,
  margin,
  yAxisLabel
) {
  const graphContainer = container
    .append("div")
    .attr("class", "graph")
    .style("margin-bottom", "20px");

  const svg = graphContainer
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3
    .scaleTime()
    .domain(d3.extent(timestamps))
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([d3.min(data), d3.max(data)])
    .range([height, 0]);

  const line = d3
    .line()
    .x((d, i) => x(timestamps[i]))
    .y((d) => y(d));

  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line);

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(formatTime));

  svg
    .append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("fill", "#000");

  svg
    .append("text")
    .attr(
      "transform",
      `translate(${width / 2},${height + margin.top + 10})`
    )
    .style("text-anchor", "middle")
    .text("Time");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(yAxisLabel);

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text(title);
}

function useLatLong() {
  const searchParams = new URLSearchParams(window.location.search);

  let lat, lng;
  for (const [key, value] of searchParams) {
    console.log(key)
      if (key === "lat") {
          lat = value;
      }
      else if (key === "lng") {
          lng = value;
      }
  }
  console.log("Latitude:", lat);
  console.log("Longitude:", lng);
  
  getWeatherGrid(lat, lng);
}

useLatLong();
