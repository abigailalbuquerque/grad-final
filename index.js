const outputElement = document.getElementById('output');
var weather = []

function getWeatherGrid(lat, lng){
    const apiUrl = "https://api.weather.gov/points/"+lat+","+lng
    console.log(apiUrl)
    fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        getWeatherData(data.properties.forecastHourly)
        return data.properties.forecastHourly
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function getWeatherData(url){
    fetch(url)
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        for (let i = 0; i<72; i++){
            weather.push(data.properties.periods[i])
        }
        console.log(weather)
    })
    .catch(error => {
        console.error('Error:', error);
    });

}

function testCalls(){
    var lat = "42.2799"
    var lng = "-71.8216"
    
    getWeatherGrid(lat, lng)

}

testCalls()