/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */


let map;
const NEW_ZEALAND_BOUNDS = {
  north: 50.59024,
  south: 24.396308,
  east: -66.93457,
  west: -125.001037,
};
const AUCKLAND = { lat: 35, lng:-90 };

function play( audio_path, time_in_milisec){
  let beep = new Audio(audio_path);
  beep.loop = true;
  beep.play();
  setTimeout(() => { beep.pause(); }, time_in_milisec);
}

//get location name from coordinates
/*function getLocationName(lat, lng){
  //console.log("recieved latlng", lat, lng);
  //return new Promise(
    fetch("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng +"&key=AIzaSyB8bxQOIFjitYbXXjlCMScqdaynYOCfzsY")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        //console.log("response")
        //console.log(response.json());
        return response.json();
      }).then((data) => {
        console.log("data");
        console.log(data.results[0].address_components[3].long_name);
        return data.results[0].address_components[3].long_name;
    })
  //)
}8*/

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: AUCKLAND,
    restriction: {
      latLngBounds: NEW_ZEALAND_BOUNDS,
      strictBounds: true,
    },
    zoom: 1,
  });

  let featureLayer = map.getFeatureLayer("LOCALITY");

  // Define a style with purple fill and border.
  //@ts-ignore
  const featureStyleOptions = {
    strokeColor: "#810FCB",
    strokeOpacity: 1.0,
    strokeWeight: 3.0,
    fillColor: "#810FCB",
    fillOpacity: 0.5,
  };
  featureLayer.style = (options) => {
    if (options.feature.placeId == "ChIJ0zQtYiWsVHkRk8lRoB1RNPo") {
      // Hana, HI
      return featureStyleOptions;
    }
  };

  google.maps.event.addListener(map, "click", (event) => onclickdo(event));

  async function onclickdo(event){
    console.log(event.latLng)
    var newMarker = addMarker(event.latLng, map);
    //convert to json
    latlngJSON = JSON.parse(JSON.stringify(event.latLng.toJSON(), null, 2));
    let lat = latlngJSON.lat;
    let lng = latlngJSON.lng;
    console.log(lat);
    console.log(lng);

    //zoom and pan
    map.setZoom(10);
    map.panTo(newMarker.position);

    //get location from coordinates
    fetch("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng +"&key=AIzaSyB8bxQOIFjitYbXXjlCMScqdaynYOCfzsY")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      }).then((data) => {
        let city = data.results[0].address_components[3].long_name;
        let state = data.results[0].address_components[4].long_name;

        //transition
        const transition_el = document.querySelector('.transition');
        setTimeout(() => {
            transition_el.classList.add('is-active');
        }, 500);

        //send as query string
        const params = new URLSearchParams({
          lat: lat,
          lng: lng,
          city: city,
          state: state
        });
        //go to weather page
        location.href = './locationPage.html?' + params.toString();
      })
    
    
  }

  //search
  const input = document.getElementById("search");
  input.className += " page-load-hover";
  input.removeAttribute('readonly'); 
  const searchBox = new google.maps.places.SearchBox(input);

  // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  // Bias the SearchBox results towards current map's viewport.
  map.addListener("bounds_changed", () => {
    console.log("bounds_changed");
    searchBox.setBounds(map.getBounds());
  });
  let markers = [];

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", () => {
    let places = searchBox.getPlaces();
    let place = places[0]

    if (places.length === 0) {
      return;
    }
    addMarker(places[0].geometry.location, map);
    
    fetch("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + place.geometry.location.lat() + "," + place.geometry.location.lng() +"&key=AIzaSyB8bxQOIFjitYbXXjlCMScqdaynYOCfzsY")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    }).then((data) => {
    
      let city = data.results[0].address_components[3].long_name;
      let state = data.results[0].address_components[4].long_name;

      //transition
      const transition_el = document.querySelector('.transition');
      setTimeout(() => {
          transition_el.classList.add('is-active');
      }, 500);
      

      const params = new URLSearchParams({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        city: city,
        state: state
      });
      location.href = './locationPage.html?' + params.toString();
    })

  });
}

window.initMap = initMap;

// Adds a marker to the map.
function addMarker(location, map) {
  // Add the marker at the clicked location, and add the next-available label
  // from the array of alphabetical characters.
  let newMarker = new google.maps.Marker({
    position: location,
    map: map,
  });
  return newMarker
}

function addPolygon(coords, map) {
  map.data.add({
    geometry: new google.maps.Data.Polygon([
      coords
    ]),
  });
}

function srSpeak(text, priority) {
  var el = document.createElement("div");
  var id = "speak-" + Date.now();
  el.setAttribute("id", id);
  el.setAttribute("aria-live", priority || "polite");
  el.classList.add("visually-hidden");
  el.style.fontSize = "0px";
  document.body.appendChild(el);

  window.setTimeout(function () {
    document.getElementById(id).innerHTML = text;
  }, 100);

  window.setTimeout(function () {
      document.body.removeChild(document.getElementById(id));
  }, 1000);
}
window.setTimeout(function () {
  const message = "To interact with this app, click tab until you hear the writing message. You will be writing down a location to get weather from in the United States.";
  srSpeak(message);
}, 3000);

