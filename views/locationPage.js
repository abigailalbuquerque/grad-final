function play(audio_path, time_in_milisec) {
  let beep = new Audio(audio_path);
  beep.loop = true;
  beep.play();
  setTimeout(() => {
    beep.pause();
  }, time_in_milisec);
}

window.onload = () => {
  const transition_el = document.querySelector(".transition");
  transition_el.classList.remove("is-active");
  setTimeout(() => {
    transition_el.classList.remove("is-active");
    //play2('./sounds/windhowl.wav');//doesn't allow playing it onload
  }, 500);
  setTimeout(() => {
    playMessage("To interact with this app, keep pressing tab to cycle through buttons. A summary will play soon.")
  }, 3000);
};

document.getElementById("back").onclick = function () {
  location.href = "./index.html";
};

// document.addEventListener("click", function (e) {
//   play("./sounds/windhowl.wav", 5000);
// });

var weather = [];
let currentDayIndex = 0;

const month_dict={ 
  "01":"January", 
  "02":"February", 
  "03":"March", 
  "04":"April", 
  "05":"May", 
  "06":"June", 
  "07":"July", 
  "08":"August", 
  "09":"September", 
  "10":"October", 
  "11":"November", 
  "12":"December", 
};

function getWeatherGrid(lat, lng) {
  const apiUrl = "https://api.weather.gov/points/" + lat + "," + lng;
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      getWeatherData(data.properties.forecastHourly);
      getWeatherAlert(data.properties.forecastZone.split("/")[5])
      return data.properties.forecastHourly;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function getWeatherData(url) {
  console.log(url)
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      let hour = data.properties.periods[0].startTime.split("T")[1].slice(0,2)
      for (let i = 0; i<72-hour; i++){
          weather.push(data.properties.periods[i])
      }
      renderWeatherCharts(weather);
      dataSummary(weather)
      const currentWeather = data.properties.periods[0];

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
      document.getElementById("temps").innerHTML =
        "High: " + highTemp + "°F &nbsp;&nbsp;&nbsp;" + "   Low: " + lowTemp + "°F";
      totalText += "The high and low temperatures are " + highTemp + "°F and " + lowTemp + "°F. ";
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
    .attr("height", height + margin.top + margin.bottom + 5)
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
    .style("font", "14px times")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(formatTime));

  svg
    .append("g")
    .style("font", "14px times")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("fill", "#000");

  svg
    .append("text")
    .attr("transform", `translate(${width / 2},${height + margin.top + 15})`)
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
  if (currentDayIndex + 24 < weather.length) {
    currentDayIndex += 24;
    renderWeatherCharts(weather);
  }
}

function scrollBack() {
  if (currentDayIndex > 0) {
    currentDayIndex -= 24;
    renderWeatherCharts(weather);
  }
}

function useLatLong() {
  const searchParams = new URLSearchParams(window.location.search);

  let lat, lng, city, state;
  for (const [key, value] of searchParams) {
    console.log(key)
    if (key === "lat") {
      lat = value;
    } else if (key === "lng") {
      lng = value;
    }
    else if (key === "city"){
      city = value;
    }
    else if (key === "state"){
      state = value;
    }
    document.getElementById("city").innerHTML =
    city +", " + state;
  }
  document.getElementById("weather-data-table").style.display = "none"
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

    animationSummary(timestamps, temperatures, precipitationChances, windSpeeds)

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
    "Wind Speed (mph)",
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
    const rainSound = new Audio('../sounds/rain.wav');
    const windSounds = new Audio('../sounds/wind.wav');

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
          console.log("rain volume:", rainSound.volume)
          rainSound.play().catch((e)=>{
            console.log("rain error: ", e);
         })
        }
      });
    }
    if (wind){
      data.forEach((d, i) => {
        if (d > 0) {
          windSounds.volume = d / 100;
          windSounds.play().catch((e)=>{
            console.log("wind error: ", e);
         })
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

function playMessage(message, priority="polite") {
  var el = document.createElement("div");
  var id = "speak-" + Date.now();
  el.setAttribute("id", id);
  el.setAttribute("aria-live", priority);
  el.classList.add("visually-hidden");
  el.style.fontSize = "0px";
  document.body.appendChild(el);

  window.setTimeout(function () {
    document.getElementById(id).innerHTML = message;
  }, 100);

  window.setTimeout(function () {
      document.body.removeChild(document.getElementById(id));
  }, 1000);
  
  
}

function getWeatherAlert(zone) {
  const url = "https://api.weather.gov/alerts/active?zone=" + zone
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data)
      let text = ""
      let screen_text = ""
      for (let i = 0; i<data.features.length; i++){
          let alert = data.features[i]
          text += "<p>" + alert.properties.event + ": " + alert.properties.instruction + "</p>"
          screen_text += alert.properties.event + ": " + alert.properties.instruction + ". "
      }
      console.log(data.features.length)
      if (data.features.length == 0){
        text = "<p>No weather alerts!</p>"
      }
      document.getElementById("weather-alert").innerHTML = text
      if (text != "<p>No weather alerts!</p>"){
        document.getElementById("weather-alert-box").style.background = "#ffd700"
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function changeView(){
  if(document.getElementById("viewButton").textContent == "Table View"){
    changeTableSelect("all")
    document.getElementById("weather-data-table").style.display = "block"
    document.getElementById("current-information").style.display = "none"
    document.getElementById("viewButton").textContent = "Summary View"
  }
  else{
    document.getElementById("weather-data-table").style.display = "none"
    document.getElementById("current-information").style.display = "block"
    document.getElementById("viewButton").textContent = "Table View"
  }
  // if(document.get)
}

function changeTableSelect(sel) {
  let text = ""
  let screen_text = []
  if(sel == "all"){
      text = "<table border='1'><tr>"
      text += "<th>Time</th>"
      text += "<th>Temperature (F)</th>"
      text += "<th>Probability of Precipitation (%)</th>"
      text += "<th>Wind Speed (mph)</th>"
      text += "<th>Wind Direction</th></tr>"
      for (let x in weather) {
          let date = weather[x].startTime.split("T")[0]
          let time = weather[x].startTime.split("T")[1].slice(0,5)
          let s_text = tableScreenReader([{"date": date, "time": time, "temperature": weather[x].temperature, "probability of precipitation": weather[x].probabilityOfPrecipitation.value, "wind speed": weather[x].windSpeed, "wind direction": weather[x].windDirection}])
          text += "<tr tabindex='0' aria-label='" + s_text +"'>"
          text += "<td>" + date + " " + time + "</td>"
          text += "<td>" + weather[x].temperature + "</td>"
          text += "<td>" + weather[x].probabilityOfPrecipitation.value + "</td>"
          text += "<td>" + weather[x].windSpeed + "</td>"
          text += "<td>" + weather[x].windDirection + "</td>"
          text += "</tr>"

      }
      text += "</table>"
  }
  else if(sel == "temperature"){
      text = "<table border='1'><tr>"
      text += "<th>Time</th>"
      text += "<th>Temperature (F)</th>"
      for (let x in weather) {
          let date = weather[x].startTime.split("T")[0]
          let time = weather[x].startTime.split("T")[1].slice(0,5)
          let s_text = tableScreenReader([{"date": date, "time": time, "temperature": weather[x].temperature}])
          text += "<tr tabindex='0' aria-label='" + s_text +"'>"
          text += "<td>" + date + " " + time + "</td>"
          text += "<td>" + weather[x].temperature + "</td>"
          text += "</tr>"
      }
      text += "</table>"
  }
  else if(sel == "precipitation"){
      text = "<table border='1'><tr>"
      text += "<th>Time</th>"
      text += "<th>Probability of Precipitation (%)</th>"
      for (let x in weather) {
          let date = weather[x].startTime.split("T")[0]
          let time = weather[x].startTime.split("T")[1].slice(0,5)
          let s_text = tableScreenReader([{"date": date, "time": time, "probability of precipitation": weather[x].probabilityOfPrecipitation.value}])
          text += "<tr tabindex='0' aria-label='" + s_text +"'>"
          text += "<td>" + date + " " + time + "</td>"
          text += "<td>" + weather[x].probabilityOfPrecipitation.value + "</td>"
          text += "</tr>"
      }
      text += "</table>"

  }
  else if(sel == "wind"){
      text = "<table border='1'><tr>"
      text += "<th>Time</th>"
      text += "<th>Wind Speed (mph)</th>"
      text += "<th>Wind Direction</th></tr>"
      for (let x in weather) {
          let date = weather[x].startTime.split("T")[0]
          let time = weather[x].startTime.split("T")[1].slice(0,5)
          let s_text = tableScreenReader([{"date": date, "time": time, "wind speed": weather[x].windSpeed, "wind direction": weather[x].windDirection}])
          text += "<tr tabindex='0' aria-label='" + s_text +"'>"
          text += "<td>" + date + " " + time + "</td>"
          text += "<td>" + weather[x].windSpeed + "</td>"
          text += "<td>" + weather[x].windDirection + "</td>"
          text += "</tr>"
      }
      text += "</table>"
      
  }
  document.getElementById("data-table").innerHTML = text;
  
}

  
function mode(array)
{
    if(array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for(var i = 0; i < array.length; i++)
    {
        var el = array[i];
        if(modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;  
        if(modeMap[el] > maxCount)
        {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}

function min(array) {
    if (array.length === 0) {
    return undefined; // Return undefined for an empty array
    }
    
    let min = array[0];
    for (let i = 1; i < array.length; i++) {
    if (array[i] < min) {
        min = array[i];
    }
    }
    
    return min;
}

function max(array) {
    if (array.length === 0) {
    return undefined; // Return undefined for an empty array
    }
    
    let max = array[0];
    for (let i = 1; i < array.length; i++) {
    if (array[i] > max) {
        max = array[i];
    }
    }
    
    return max;
}

function animationSummary(time, temperature, rain, windspeed){
  let data = {
      model: "gpt-3.5-turbo",
      messages: [
          { role: "system", content: "You are an accessibility friendly weather reporter." },
          { role: "user", content: "Describe the temperature movement in concise sentences. Time: " +  JSON.stringify(time) + " Temperature: " + JSON.stringify(temperature)},

      ],
      temperature: 0
  };

  console.log(data)

  data = {
    model: "gpt-3.5-turbo",
    messages: [
        { role: "system", content: "You are an accessibility friendly weather reporter." },
        { role: "user", content: "Describe the change in windspeed in concise sentences. Time: " +  JSON.stringify(time) + " Windspeed: " + JSON.stringify(windspeed)},

    ],
    temperature: 0
  };

  console.log(data)

  data = {
    model: "gpt-3.5-turbo",
    messages: [
        { role: "system", content: "You are an accessibility friendly weather reporter." },
        { role: "user", content: "Describe the change in rain in concise sentences. Time: " +  JSON.stringify(time) + " Probability of Precipitation: " + JSON.stringify(rain)},

    ],
    temperature: 0
  };
  console.log(data)
}

function dataSummary(weather) {
  let text = ""
  let currentDate = weather[0].startTime.split("T")[0]
  dates = [currentDate]
  forecasts = []
  directions = []
  minTemp = []
  maxTemp = []
  rain = []
  speeds = []
  currForecasts = []
  currDirections = []
  currTemperatures = []
  currSpeeds = []
  currRain = []
  for (let x in weather) {
      currForecasts.push(weather[x].shortForecast)
      currDirections.push(weather[x].windDirection)
      currTemperatures.push(weather[x].temperature)
      currSpeeds.push(parseInt(weather[x].windSpeed.split(" ")[0]))
      currRain.push(parseInt(weather[x].probabilityOfPrecipitation.value))
      if(currentDate != weather[x].startTime.split("T")[0]){
          currentDate = weather[x].startTime.split("T")[0]
          forecasts.push(mode(currForecasts))
          directions.push(mode(currDirections))
          rain.push(max(currRain))
          minTemp.push(min(currTemperatures))
          maxTemp.push(max(currTemperatures))
          speeds.push(currSpeeds.reduce((a, b) => a + b) / currSpeeds.length)
          currForecasts = []
          currDirections = []
          currTemperatures = []
          currSpeeds = []
          currRain = []
          dates.push(currentDate)
      }
  }
  forecasts.push(mode(currForecasts))
  directions.push(mode(currDirections))
  rain.push(max(currRain))
  minTemp.push(min(currTemperatures))
  maxTemp.push(max(currTemperatures))
  speeds.push(currSpeeds.reduce((a, b) => a + b) / currSpeeds.length)

  for(let i = 0; i<dates.length; i++){
      let month = dates[i].split("-")[1]
      let date = dates[i].split("-")[2]
      text += month_dict[month] + " " + date
      text += forecasts[i]
      text += " with highs of " + maxTemp[i] + " and lows of " + minTemp[i]
      text += ". The highest chance of rain is " + rain[i]
      text += " with an average windspeed of " + speeds[i]
      text += " in the direction of " + directions[i] +". "
  }
}

function tableScreenReader(data){
  let screen_text = ""
  // let screen_text = "You are now in the table view page. In a bit, information will be said about the selected weather location. To change how much information is viewed, navigate via tab to the mode buttons to select what info you want. "
  let currentDate = undefined;
  for(let point of data){
    const date = point['date']
    const time = point['time'].split(":")[0]
    if (date !== currentDate) {
      currentDate = date
      screen_text += "On " + date + " at " + time + " "
    }
    else {
      screen_text += "Next, at " + time + " "
    }
    delete point['date']
    delete point['time']
    const vars = Object.entries(point)
    for(const [key, value] of vars){
      screen_text += "the " + key + " is " + value + " "
      if(key !== vars[vars.length - 1][0]){
        screen_text += " and "
      }
      else {
        screen_text = screen_text.slice(0, -1); 
        screen_text += ". "
      }
      
    }
  }
  return screen_text

}

useLatLong();


let previousTabbedElements = []; // Keep track of previously tabbed elements

// Store initial tab order
document.querySelectorAll('button').forEach(button => {
    previousTabbedElements.push(button);
});
// Listen for Tab key press
document.addEventListener('keydown', function(event) {
  if (event.key === 'Tab') {
      // Restore tabbable state of previously tabbed elements
      previousTabbedElements.forEach(element => {
          element.tabIndex = 0;
      });
  }
});