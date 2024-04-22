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

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: AUCKLAND,
    restriction: {
      latLngBounds: NEW_ZEALAND_BOUNDS,
      strictBounds: true,
    },
    zoom: 1,
  });
  // could do a marker? 
  map.addListener("click", (location) => {
    // 3 seconds after the center of the map has changed, pan back to the
    // marker.
   console.log("Here", location.fi.x, location.fi.y)
  });
  const input = document.getElementById("pac-input");
  map.className += " page-load-hover";
  input.removeAttribute('readonly'); 
  input.value="E"
  const searchBox = new google.maps.places.SearchBox(input);
  console.log(searchBox)

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  console.log("Here")
  // Bias the SearchBox results towards current map's viewport.
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });
  let markers = [];

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", () => {
    let places = searchBox.getPlaces();
    places = [places[0]]

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    const bounds = new google.maps.LatLngBounds();
    console.log(places)
    //TODO block places from being chosen outside of the area

    places.forEach((place) => {
      if (!place.geometry || !place.geometry.location) {
        console.log("Returned place contains no geometry");
        return;
      }

      const icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25),
      };

      // Create a marker for each place.
      markers.push(
        new google.maps.Marker({
          map,
          icon,
          title: place.name,
          position: place.geometry.location,
        }),
      );
      console.log(place.geometry.location.lat(), place.geometry.location.lng())
      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
}

window.initMap = initMap;

function updateScreenReaderMessage(message) {
  var screenReaderMessage = document.getElementById('screen-reader-message');
  screenReaderMessage.textContent = message;
}

// Example usage
window.onload = function() {
  // Assume some event triggers the message to be updated
  var message = "This is a message for the screen reader";
  updateScreenReaderMessage(message);
};
