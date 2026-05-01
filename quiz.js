const inputBox = document.getElementById('user-input');
var countries = []
var countryNames = []
var randomCountry

// d3.json("/static/adjearth.json", function (d) {
//     console.log(d);
// });

fetch('./static/adjearth.json')
  .then((response) => response.json())
  .then((data) => {
    for (const object of data["features"]) {
        countries.push({
            "name": object["properties"]["name"],
            "iso_a2": object["properties"]["iso_a2_eh"]
        })
        countryNames.push(object["properties"]["name"])
    }
  })
  .catch(console.error);
console.log(countryNames)
function start(mode) {

}

function updateUI(input) {
    // If input is country

    // Update Variables (save)

    // Update UI

    // Generate new country

    // Set flag to country

    // Empty input

    // Else

    // Update Variables (save)

    // Update UI

}

function endGame() {
    // Reset flag / reset to beginning page

    // Save score

    // Show modal

    // 0 variables
}

inputBox.addEventListener('input', function() {
    var val = this.value.toLowerCase();

    for (const name of countryNames) {
        var sliced = name.slice(0, val.length).toLowerCase()

        if (sliced === val && sliced.length != name.length) {
            // Create css
            console.log(sliced.toUpperCase() + name.slice(val.length))
        }
    }
})
