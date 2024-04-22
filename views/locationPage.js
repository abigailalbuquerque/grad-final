function play(audio_path, time_in_milisec) {
  let beep = new Audio(audio_path);
  beep.loop = true;
  beep.play();
  setTimeout(() => {
    beep.pause();
  }, time_in_milisec);
}

window.onload = () => {
  console.log("new page load");
  const transition_el = document.querySelector(".transition");
  transition_el.classList.remove("is-active");
  setTimeout(() => {
    console.log("remove");
    transition_el.classList.remove("is-active");
    //play2('./sounds/windhowl.wav');//doesn't allow playing it onload
  }, 500);
};

document.getElementById("back").onclick = function () {
  console.log("clicked");
  location.href = "./index.html";
};

// document.addEventListener("click", function (e) {
//   play("./sounds/windhowl.wav", 5000);
// });

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
      const currentWeather = data.properties.periods[0];
      console.log(currentWeather);
      // const weatherAlert = data.properties.weatherAlerts[0];

      document.getElementById("current-temp").innerHTML =
        currentWeather.temperature + "°F";
      document.getElementById("condition").innerHTML =
        currentWeather.shortForecast;
      document.getElementById("wind-speed").innerHTML =
        "Wind Speed: " + currentWeather.windSpeed;
      document.getElementById("wind-direction").innerHTML =
        "Wind Direction: " + currentWeather.windDirection;

      if (currentWeather.icon) {
        const img = document.createElement("img");
        img.setAttribute("width", "100%");
        img.setAttribute("height", "100%");
        img.style.border = "2px solid gray";
        img.style.borderRadius = "10px";
        var iconUrl = currentWeather.icon;
        const truncatedUrl = iconUrl.split(",")[0];
        img.setAttribute("src", truncatedUrl);
        img.setAttribute("alt", currentWeather.shortForecast);
        const weatherImageContainer = document.getElementById("weather-image");
        weatherImageContainer.innerHTML = "";
        weatherImageContainer.appendChild(img);
      }

      const currentDate = new Date();
      const currentDay = currentDate.getDate();

      let highTemp, lowTemp;
      for (let i = 0; i < weather.length; i++) {
        const weatherDate = new Date(weather[i].startTime);
        const weatherDay = weatherDate.getDate();

        if (weatherDay === currentDay) {
          const temperature = weather[i].temperature;
          if (highTemp === undefined || temperature > highTemp) {
            highTemp = temperature;
          }
          if (lowTemp === undefined || temperature < lowTemp) {
            lowTemp = temperature;
          }
        } 
        else if (weatherDay > currentDay) {
          break;
        }
      }

      console.log("High temperature:", highTemp);
      console.log("Low temperature:", lowTemp);

      document.getElementById("temps").innerHTML =
        "High: " + highTemp + "°F &nbsp;&nbsp;&nbsp;" + "   Low: " + lowTemp + "°F";
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function renderWeatherCharts(weatherData) {
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = 400 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;
  const numHours = 24;

  const container = d3.select("#graphContainer");
  container.selectAll(".graph").remove();
  const parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S%Z");
  const formatTime = d3.timeFormat("%-I %p");
  const timestamps = weatherData
    .slice(currentDayIndex, currentDayIndex + numHours)
    .map((d) => parseTime(d.startTime));
  const temperatures = weatherData
    .slice(currentDayIndex, currentDayIndex + numHours)
    .map((d) => d.temperature);
  const windSpeeds = weatherData
    .slice(currentDayIndex, currentDayIndex + numHours)
    .map((d) => {
      let speed = d.windSpeed.match(/\d+/);
      return speed ? +speed[0] : 0;
    });

    const precipitationChances = weatherData
    .slice(currentDayIndex, currentDayIndex + numHours)
    .map((d) => +d.probabilityOfPrecipitation.value);

  createChart(
    container,
    "Temperature",
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
    "Wind Speed",
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
    "Precipitation",
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

  const x = d3.scaleTime().domain(d3.extent(timestamps)).range([0, width]);

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
    .attr("transform", `translate(${width / 2},${height + margin.top + 10})`)
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

function scrollRight() {
  console.log("clicked next");
  if (currentDayIndex + 24 < weather.length) {
    currentDayIndex += 24;
    renderWeatherCharts(weather);
  }
}

function scrollBack() {
  console.log("clicked back");
  if (currentDayIndex > 0) {
    currentDayIndex -= 24;
    renderWeatherCharts(weather);
  }
}


function useLatLong() {
  const searchParams = new URLSearchParams(window.location.search);

  let lat, lng;
  for (const [key, value] of searchParams) {
    if (key === "lat") {
      lat = value;
    } else if (key === "lng") {
      lng = value;
    }
  }
  getWeatherGrid(lat, lng);
}


function animation() {
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = 400 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;
  const numHours = 24;

  const container = d3.select("#graphContainer");
  container.selectAll(".graph").remove();
  const parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S%Z");
  const formatTime = d3.timeFormat("%-I %p");
  const timestamps = weather
    .slice(currentDayIndex, currentDayIndex + numHours)
    .map((d) => parseTime(d.startTime));
  const temperatures = weather
    .slice(currentDayIndex, currentDayIndex + numHours)
    .map((d) => d.temperature);
  const windSpeeds = weather
    .slice(currentDayIndex, currentDayIndex + numHours)
    .map((d) => {
      let speed = d.windSpeed.match(/\d+/);
      return speed ? +speed[0] : 0;
    });

    const precipitationChances = weather
    .slice(currentDayIndex, currentDayIndex + numHours)
    .map((d) => +d.probabilityOfPrecipitation.value);

    animationPlay(
    container,
    "Temperature",
    temperatures,
    timestamps,
    formatTime,
    height,
    width,
    margin,
    "Temperature (°F)",
    false,
    false
  );
  animationPlay(
    container,
    "Wind Speed",
    windSpeeds,
    timestamps,
    formatTime,
    height,
    width,
    margin,
    "Wind Speed (km/h)",
    false,
    true
  );
  animationPlay(
    container,
    "Precipitation",
    precipitationChances,
    timestamps,
    formatTime,
    height,
    width,
    margin,
    "Chance of Precipitation (%)",
    true,
    false
  );
}

function animationPlay(container,
  title,
  data,
  timestamps,
  formatTime,
  height,
  width,
  margin,
  yAxisLabel,
  rain,
  wind){
    const rainSound = new Audio('../sounds/rain.mp3');
    const windSounds = new Audio('../sounds/wind.mp3');

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
  
    const x = d3.scaleTime().domain(d3.extent(timestamps)).range([0, width]);
  
    const y = d3
      .scaleLinear()
      .domain([d3.min(data), d3.max(data)])
      .range([height, 0]);
  
    const line = d3
      .line()
      .x((d, i) => x(timestamps[i]))
      .y((d) => y(d));
  
    const path = svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  
    const totalLength = path.node().getTotalLength();
  
    path
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(4000)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0)
    .on("start", function() {
      if (rain){
      data.forEach((d, i) => {
        if (d > 0) {
          rainSound.volume = d / 100;
          rainSound.play();
        }
      });
    }
    if (wind){
      data.forEach((d, i) => {
        if (d > 0) {
          windSounds.volume = d / 100;
          windSounds.play();
        }
      });
    }
    })
    .on("end", function() {
      rainSound.pause();
      windSounds.pause()
    });

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
      .attr("transform", `translate(${width / 2},${height + margin.top + 10})`)
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


useLatLong();
