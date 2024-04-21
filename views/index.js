/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
//const {Polyline} = await google.maps.importLibrary("maps")



let map;
const NEW_ZEALAND_BOUNDS = {
  north: 50.59024,
  south: 24.396308,
  east: -66.93457,
  west: -125.001037,
};
const AUCKLAND = { lat: 35, lng:-90 };

//const audio = new Audio('./wind.mp3');

function play( audio_path, time_in_milisec){
  let beep = new Audio(audio_path);
  beep.loop = true;
  beep.play();
  setTimeout(() => { beep.pause(); }, time_in_milisec);
}






function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: AUCKLAND,
    restriction: {
      latLngBounds: NEW_ZEALAND_BOUNDS,
      strictBounds: true,
    },
    zoom: 1,
  });

  featureLayer = map.getFeatureLayer("LOCALITY");

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



  /*google.maps.event.addListener(marker, 'click', function() {
    //map.panTo(this.getPosition());
  }); */ 
  // could do a marker? 
   /*map.addListener("click", (location) => {
    // 3 seconds after the center of the map has changed, pan back to the
    // marker.
    //window.location.href = "./locationPage.html";
    console.log("Here", location.fi.x, location.fi.y);
    /*var myLatlng = new google.maps.LatLng(-25.363882,131.044922);
    var marker = new google.maps.Marker({
      position: myLatlng,
      title:"Hello World!"
    });

    marker.setMap(map);*/
    //map.setCenter(new google.maps.LatLng(location.fi.x, location.fi.y));
    //map.setZoom(7);
    // This event listener calls addMarker() when the map is clicked.
    
  //});

  google.maps.event.addListener(map, "click", (event) => {
    var newMarker = addMarker(event.latLng, map);
    //convert to json
    latlngJSON = JSON.parse(JSON.stringify(event.latLng.toJSON(), null, 2));
    let lat = latlngJSON.lat;
    let lng = latlngJSON.lng;
    console.log(lat);
    console.log(lng);

    map.setZoom(10);
    map.panTo(newMarker.position);

    //play('./sounds/wind.mp3', 10000);
    
    //play('./sounds/birds.mp3', 4000);
    //play('./sounds/rain-and-thunder.mp3', 5000);

    const transition_el = document.querySelector('.transition');
    //transition_el.classList.add('is-active');
    setTimeout(() => {
        transition_el.classList.add('is-active');
        //play('./sounds/windhowl.wav', 5000)
    }, 500);

    const params = new URLSearchParams({
      lat: lat,
      lng: lng
    });
    location.href = './locationPage.html?' + params.toString();
    /*
    coords = [
      { lat: lat + 1, lng: lng + 1 },
      { lat: lat - 1, lng: lng - 1 },
      { lat: lat - 1, lng: lng + 1 },
      { lat: lat + 1, lng: lng - 1 },
    ];*/
    //addPolygon(coords, map);
});

}

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


window.initMap = initMap;
