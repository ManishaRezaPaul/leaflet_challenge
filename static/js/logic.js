url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Access the data using d3.json
d3.json(url).then((data) => {

    let eqd = data.features
    createFeatures(eqd)

});

// createFeatures function to include popup of the place where earthquake took place
function createFeatures(eqd) {

    function getColorByDepth(depth) {
        if (depth < 10) {
            return '#78f100';
        } else if (depth < 30) {
            return '#dcf400';
        } else if (depth < 50) {
            return '#f7db11';
        } else if (depth < 70) {
            return '#FFA500';
        } else if (depth < 90) {
            return '#fdb72a';
        } else {
            return '#ff6066';
        }
    };


    function pointToLayer(feature, latlng) {
        // Change the size of the marker as per the magnitude of the earthquake
        let magnitude = feature.properties.mag;
        let radius = magnitude * 5; 

        // Change the color of the marker as per the depth of the earthquake
        let depth = feature.geometry.coordinates[2];
        let fillColor = getColorByDepth(depth);

        return L.circleMarker(latlng, {
            radius: radius,
            fillColor: fillColor,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
    };

    function onEachFeature(feature, layer) {
        if (feature.properties && feature.properties.place) {
            let [longitude, latitude, depth] = feature.geometry.coordinates;
            let popupContent = `
                <h2>Place: ${feature.properties.place}</h2>
                <hr>
                <h3>Magnitude: ${feature.properties.mag}</h3>
                <hr>
                <h3>Coordinates:</h3>
                <p>Latitude: ${latitude.toFixed(4)}</p>
                <p>Longitude: ${longitude.toFixed(4)}</p>
                <p>Depth: ${depth.toFixed(2)} km</p>
            `;
            layer.bindPopup(popupContent);
        }
    };

    let earthquake = L.geoJSON(eqd, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    });
    

    createMap(earthquake);

}

// createMap function to take the earthquake data and add it onto the map

function createMap(earthquakes) {

    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })
    
      let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      });

    // Create baseMaps object 

      let baseMaps = {
        "Street Map": street,
      };
    
    // Create overlayMap object 

      let overlayMaps = {
        "Earthquake Data": earthquakes
        };

    // Create a new map 

        let myMap = L.map("map", {
            center: [
              40.70, -112.00
            ],
            zoom: 4.5,
            layers: [street, earthquakes]
          });
    // Create a layer control that contains the baseMap

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
    }).addTo(myMap);

    // Define color ranges for the depth of the earthquake
    colorRange =  [
        { color: '#78f100', label: '-10 - 10' },
        { color: '#dcf400', label: '10 - 30' },
        { color: '#f7db11', label: '30 - 50' },
        { color: '#FFA500', label: '50 - 70' },
        { color: '#fdb72a', label: '70 - 90' },
        { color: '#ff6066', label: '90+' }
    ]
 

    // Create a legend to display information about our map.
    let legend = L.control({
    position: "bottomright"
  });


  // When the layer control is added, insert a div with the class of "legend".
    legend.onAdd = function(myMap) {
    let div = L.DomUtil.create("div", "legend");

    // Add a white background
    div.style.backgroundColor = 'white';

    // Loop through colorRange and add color boxes and labels
    colorRange.forEach(range => {
        let colorBox = `<div class="color-box" style="background-color: ${range.color}"></div>`;
        let label = `<div class="legend-label">${range.label}</div>`;
        div.innerHTML += colorBox + label;
    });

    return div;
  };

  // Add the info legend to the map.
  legend.addTo(myMap);

}

