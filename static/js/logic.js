// Access our API for collection of data using a variable
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// carry out GET request for the data and parse it into a function
d3.json(earthquakeUrl, function(data) {
  createFeatures(data.features);
});

  // Create a function to run on each feature and popup for each feature with details

function createFeatures(earthquakeData) {

  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Location: "+ feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
    
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: .8,
        color: "#556B2F",
        stroke: true,
        weight: .9
    })
  }
  });

  
  // Add the earthquakes layer to our createMap function
  createMap(earthquakes);
}


function createMap(earthquakes) {

    // Create the appropriate layers for streetmap and darkmap
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG9sdW9sYXllbWkiLCJhIjoiY2p3aWZtZmN6MGdvZjQ0bXhjcmp6b25xbiJ9.tYN2t01CLDHKxswLrUf4PA");

  
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG9sdW9sYXllbWkiLCJhIjoiY2p3aWZtZmN6MGdvZjQ0bXhjcmp6b25xbiJ9.tYN2t01CLDHKxswLrUf4PA");


    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG9sdW9sYXllbWkiLCJhIjoiY2p3aWZtZmN6MGdvZjQ0bXhjcmp6b25xbiJ9.tYN2t01CLDHKxswLrUf4PA");

  
   
    // Define the basemap using variables
    var baseMaps = {
      "Outdoors": outdoors,
      "Satellite": satellite,
      "Dark Map": darkmap
    };

    // Creat a layer for the tectonic plates
    var tectonicPlates = new L.LayerGroup();

    // Create overlay object to hold our overlay layer
    let overlayMaps = {
      "Earthquakes": earthquakes,
      "Tectonic Plates": tectonicPlates
    };

    // Create the outdoors, earthquakes and tectonic plates layers on the map
    var myMap = L.map("map", {
      center: [
        37.09, -95.71],
      zoom: 3.5,
      layers: [outdoors, earthquakes, tectonicPlates]
    }); 

    // Add Fault lines 
    d3.json(tectonicPlatesUrl, function(plateData) {
      L.geoJson(plateData, {
        color: "brown",
        weight: 2
      })
      .addTo(tectonicPlates);
  });

  
    // Add layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

  //Create a legend on the map
  var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(myMap){
      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

  // generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };

  legend.addTo(myMap);
}
   

  //color scale for the circle diameter 
  function getColor(d){
    return d > 5 ? "#342B09":
    d > 4 ? "#B08A03":
    d > 3 ? "#FCCB1A":
    d > 2 ? "#FDE281":
    d > 1 ? "#FEF7DC":
             "#F0F7D4";
  }

  //increase the magnitude of the earthquake by a factor of 35,000 for the radius of the circle to enhance the display. 
  function getRadius(value){
    return value*35000
}