
const width = 1038;
const height = 500;

const svg = d3.select("svg")
  // SVG SCALING https://chartio.com/resources/tutorials/how-to-resize-an-svg-when-the-window-is-resized-in-d3-js/
  // Viewbox explanaition https://stackoverflow.com/questions/14553392/perplexed-by-svg-viewbox-width-height-etc 
  .attr("viewBox", [0, 0, width, height])
  .style('background-color', '#ffffffff')
    // .on("contextmenu", function (event) {
    //     event.preventDefault();
    // }); // Prevent context menu showup

// g svg element explanation https://jenkov.com/tutorials/svg/g-element.html
const map = svg.append("g");
const geo = map.append("g");

Promise.all([
  d3.json("./static/adjearth.json"),
  d3.json("./static/majority-outlines.json"),
]).then(function([json, majorityOutlines]) {

const projection = d3.geoNaturalEarth1()
  .rotate([-12, 0]); // Rotate Map so pacific islands are shown

const path = d3.geoPath(projection); // for SVG

const projection1 = d3.geoNaturalEarth1()
  .rotate([-12, 0]);

const path1 = d3.geoPath(projection1)

var validCountries = [];
var invalidCountries = [];
var smallCountries = [];
var customOutlines = [];
var count = 0;
var countrynames = [];
var sbrgnList = [];

const customIsoList = majorityOutlines['features'].map(obj => obj['properties']['iso_a2'])

// Sorting geojson data
const keyTypes = ["Country", "Sovereign country", "Sovereignty"];

// Sort countries json 
for (const key in json["features"]) {
    if (keyTypes.includes(json["features"][key]["properties"]["type"])) {
      if (path.area(json["features"][key]) < 1.5) {
        if (!customOutlines.includes(json["features"][key]["properties"]["iso_a2_eh"])) {
          if (!customIsoList.includes(json["features"][key]["properties"]["iso_a2_eh"])) {
            console.log("TOO SMALL: " + json["features"][key]["properties"]["name"])
            smallCountries.push(json["features"][key]);
          }
        }
      }
      count++;
      countrynames.push(json["features"][key]["properties"]["name"])
      validCountries.push(json["features"][key]);

      if (countryDetails.find(object => object.alpha2Code === json["features"][key]["properties"]["iso_a2_eh"]) == null) {
      console.log("CAPITAL INVALID: " + json["features"][key]["properties"]["name"])
      }
    } else {
      invalidCountries.push(json["features"][key]); 
    }
} 
console.log("COUNT IS: " + count)
// Normalize custom outlines file to match natural earth properties
for (const obj of majorityOutlines["features"]) {
  var iso = obj['properties']['iso_a2']
  var item = validCountries.find(object => object['properties']['iso_a2_eh'] === iso)
  obj['properties'] = item['properties']
  customOutlines.push(obj)
}
console.log(customOutlines)
console.log(countrynames)
// Regions to play
const regions = ["North_America", "South_America", "Africa", "Europe", "Caribbean", "Asia", "Western_Asia", "Oceania"];
// COMPLETE REGION LIST -> ['Central_America', 'Caribbean', 'Northern_America', 'South-Eastern_Asia', 'Western_Asia', 'Southern_Asia', 'Eastern_Asia', 'Central_Asia', 'Seven_seas_(open_ocean)', 'South_America', 'Eastern_Africa', 'Northern_Africa', 
// 'Middle_Africa', 'Southern_Africa', 'Western_Africa', 'Western_Europe', 'Eastern_Europe', 'Northern_Europe', 'Southern_Europe', 'Melanesia', 'Australia_and_New_Zealand', 'Polynesia', 'Micronesia', 'Antarctica']

// Colors for regions (unordered)
var myColor = d3.scaleOrdinal().domain(regions)
  .range(["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fec5a6ff","#b3ffe9ff","#e5d8bd","#fddaec","#f2f2f2"])

// Create country paths
const countries = geo.append("g")
  .selectAll("path")
  .data(validCountries)
  .join("path")
    .attr("id", d => d.properties.name)
    .attr("d", path)
    .attr("class", getClass)
    .style("fill", function(d){return myColor(d3.select(this).attr("class")) })
    .style("stroke", "black")
    .style("stroke-width", 0.1)
    .on("click", handleClick)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)

const custom = geo.append("g")
  .selectAll("path")
  .data(majorityOutlines['features'])
  .join("path")
    .attr("d", path)
    .attr("class", getClass)
    .style("fill", function(d){return myColor(d3.select(this).attr("class")) })
    .style("fill-opacity", 0.5)
    .style("stroke", "black")
    .style("stroke-width", 0.1)
    .style("stroke-dasharray", ("3, 1"))
    .on("click", handleClick)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    
// Create greyed out paths for non countries
const noncountries = geo.append("g")
  .selectAll("path")
  .data(invalidCountries)
  .join("path")
    .attr("d", path)
    .style("fill", "#999694")
    .style("stroke", "white")
    .style("stroke-width", 0.1)

// Country name labels
const labelGroup = map.append("g")
const labels = labelGroup.append("g")
    .selectAll("text")
    .data(validCountries)
    .join("text")
      .attr("x", d => path.centroid(d)[0])
      .attr("y", d => path.centroid(d)[1])
      .attr("pointer-events", "none")
      .text(d => d.properties.name)
      .style("opacity", 0)
      .attr("font-family", "Roboto Slab")
      .style("font-size", 4.5)

// Boxes for labels
const labelBoxes = labelGroup.selectAll("rect")
  .data(validCountries)
  .enter().append("rect")
    .attr("pointer-events", "none")
    .style("fill", "white")
    .style("stroke", "black")
    .style("stroke-width", 0.1)
    .style("fill-opacity", 0.75)
    .style("opacity", 0)
    .attr("id", d => d.properties.name)
    .attr("rx", 0.5)
    .attr("ry", 0.5 )
    .each(function(d) {
      parent = labels.filter((function() {return d3.select(this).text() === d.properties.name;})).node()
      offset = 2

      d3.select(this)
        .attr("x", parent.getBBox().x - offset / 2)
        .attr("y", parent.getBBox().y - offset / 2)
        .attr("height", parent.getBBox().height + offset)
        .attr("width", parent.getBBox().width + offset)
    })
    .lower()

// Circle outline for small countries 
const smallCountriesOutlines =  geo.append("g")
  .selectAll("circle")
  .data(smallCountries)
  .enter().append("circle") 
    .attr("id", d => d.properties.name)
    .attr("class", getClass)
    .attr("cx", d => path.centroid(d)[0])
    .attr("cy", d => path.centroid(d)[1])
    .attr("r", 2)
    .style("stroke", "#000000ff")
    .style("stroke-width", 0.1)
    .style("fill", function(d){return myColor(d3.select(this).attr("class")) })
    .style("fill-opacity", 0.5)
    .on("click", handleClick)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)

const UI = svg.append("g")
const scoreGroup = UI.append("g")

const qheight = 50;
const quizBar = UI.append("g")
  .append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("height", qheight)
  .attr("width", width)
  .attr("rx", 4)
  .attr("ry", 4)
  .style("fill", "#3f4b68ff")
  .style("opacity", 0.75)

const flagOffset = 4;
const flagHeight = qheight - flagOffset * 2
const flagWidth = flagHeight * (5 / 3)

const flag = UI.append("svg:image")
  .attr("x", width - flagWidth - flagOffset)
	.attr("y", flagOffset)
  .attr('width', flagWidth)
  .attr('height', flagHeight)
  .attr("xlink:href", null)
  .attr('opacity', '0')

const scoreUI = UI.append("text")
  .attr("dominant-baseline", "central")
  .attr("font-size", 15)
  .attr("x", 50)
	.attr("y", qheight / 2)
  .attr("text-anchor", "middle")
  .attr("cursor", "default")
  .attr("fill", "white")
  .attr("opacity", 0)

const resetButton = UI.append("text")
  .text("Back")
  .attr("x", 15)
	.attr("y", qheight + 20)
  .on("click", backBtn)
  .style("opacity", "0")

  const quitButton = UI.append("text")
    .text("Quit Game")
    .attr("x", width - 90)
    .attr("y", qheight + 20)
    .on("click", quitGame)
    .style("opacity", 0)

const clickOnTextContent = "Click a Region to Start | Hold left click to pan & scroll to zoom"
const clickOnText = UI.append("text")
  .text(clickOnTextContent)
  .attr("dominant-baseline", "central")
  .attr("font-size", 20)
  .attr("x", width / 2)
	.attr("y", qheight / 2)
  .attr("text-anchor", "middle")
  .attr("cursor", "default")
  .attr("fill", "white")
  .attr("opacity", 1) 

// tooltip
//     .style("display", "block")
//     .style("left", `${xPos + 150}px`)
//     .style("top", `${yPos + 50}px`)
//     .style("background-color", myColor(currentName))
//     .html(`<strong>Date:</strong> ${d.name}`)

function backBtn() {
  saveGameState()
  reset()
}

// See if country region is in regions in play, asigns class
function getClass(d) { 
  if (regions == null) {
    return d.properties.subregion.replaceAll(" ", "_")
  } else if (regions.includes(d.properties.subregion.replaceAll(" ", "_"))) {
    console.log(d.properties.subregion.replaceAll(" ", "_"))
    return d.properties.subregion.replaceAll(" ", "_")
  } else if (regions.includes(d.properties.continent.replaceAll(" ", "_"))) {
    console.log((d.properties.continent).replaceAll(" ", "_"))
    return (d.properties.continent).replaceAll(" ", "_")
  } 
  // Json has been edited for proper classification of: Mauritius, Maldives, and Seychelles
  console.log("D classification error:" + d.properties.name + d.properties.continent + d.properties.subregion) 
}

// Color in subregions of country
// INEFFECTIVE since checks every time you click. make json durring initial processing
// Each dclass has an array of unique subregions
// If subregion length is null just return myColor
function colorSubregions(d){
  var dclass = d3.select(this).attr("class");
  console.log('SUBREGION IS: ' + d.properties.subregion)
  console.log(d)

  var region = d3.selectAll("." + dclass)["_groups"][0] 
  var subregions = [];

  for (var i = 0; i < region.length; i++) {
    if (subregions.includes(region[i]["__data__"]["properties"]["subregion"])) {
      continue;
    } 
    subregions.push(region[i]["__data__"]["properties"]["subregion"])
  }
  if (subregions.length == 1) {
    return myColor(d3.select(this).attr("class"))
  }

  var subregionColor = d3.scaleOrdinal().domain(subregions)
    .range(["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fec5a6ff","#b3ffe9ff","#e5d8bd","#fddaec","#f2f2f2"])

  console.log(d.properties.subregion)
  console.log(subregions)
  return subregionColor(d.properties.subregion)
}

var mistakes = 0;
var clicks = 0;
var correctAnswers = 0;
var clickedCountries = [];
var selectedRegion;
var randomCountry;
var gameMode = "Countries";
var gameOn = false;

const modalContent = document.getElementById('exampleModal');
const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
const scoreText = modalContent.querySelector('#scoreText')
const regionText = modalContent.querySelector('#regionText')
const modeText = modalContent.querySelector('#modeText')

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

window.getFact = () => {
  const text = document.getElementById("factText")
  var random = Math.floor(Math.random() * countryDetails.length);
  randomCountry = countryDetails[random]

  const factTopics = ["demonyms", "capitals", "currencies", "languages"]
  random =  Math.floor(Math.random() * factTopics.length);
  
  if (random == 0) {
    text.innerHTML = "The demonym of " + searchWord(randomCountry.name) + " is " + searchWord(randomCountry.demonym) + "."
  } else if (random == 1) {
    text.innerHTML = "The capital of " + searchWord(randomCountry.name) + " is " + searchWord(randomCountry.capital) + "."
  } else  if (random == 2) {
    var currencyCount = (randomCountry.currencies).length

    if (currencyCount == 1) {
      text.innerHTML = "The " + searchWord(randomCountry["currencies"][0]["name"]) + " is the currency of " + searchWord(randomCountry.name) + "."
    } else if (currencyCount == 2) {
      text.innerHTML = "The " + searchWord(randomCountry["currencies"][0]["name"]) + " and the " + searchWord(randomCountry["currencies"][1]["name"]) + " are the currencies of " + searchWord(randomCountry.name) + "."
    } else if (currencyCount > 2) {
      text.innerHTML = searchWord(randomCountry.name) + " uses several currencies including "  + searchWord(randomCountry["currencies"][0]["name"]) + " and " + searchWord(randomCountry["currencies"][1]["name"]) + "."
    }
  } else if (random == 3) {
    var languageCount = (randomCountry.languages).length
    
    if (languageCount == 1) {
      text.innerHTML = searchWord(randomCountry["languages"][0]["name"]) + " is the official language of " + searchWord(randomCountry.name) + "."
    } else if (languageCount == 2) {
      text.innerHTML = searchWord(randomCountry["languages"][0]["name"]) + " and " + searchWord(randomCountry["languages"][1]["name"]) + " are the official languages of " + searchWord(randomCountry.name) + "."
    } else if (languageCount > 2) {
      var temp = "";
      for (var k = 0; k < languageCount - 1; k++) {
        temp += searchWord(randomCountry["languages"][k]["name"])
        temp += ", "
      }
      text.innerHTML = temp + "and " + searchWord(randomCountry["languages"][languageCount - 1]["name"]) + " are the official languages of " + searchWord(randomCountry.name) + "."
    }
  }
}

function searchWord(word) {
  return "<a target='_blank' href='https://www.google.com/search?q=" + word + "'>" + word + "</a>"
}

getFact()

var labelsShown = false
const labelBtnText = document.getElementById('label-btn-text')

window.showLabels = () => {
  if (labelsShown) {
    labels.style("opacity", 0)
    labelBoxes.style('opacity', 0)
    labelsShown = false
	labelBtnText.textContent = 'Show Labels'
  } else {
    labels.style("opacity", 1)
    labelBoxes.style('opacity', 1)
    labelsShown = true
	labelBtnText.textContent = 'Hide Labels'
  }
  
}

const maxScores = 2

window.clearScores = () => {
  var scoreSelect = document.getElementById("score-mode-select")

  for (const region in regions) {
    for (const option of scoreSelect) {
      localStorage.removeItem(regions[region] + option.value)
    }
  }
  // localStorage.clear();
  updateScores(gameMode)
}

document.getElementById("score-mode-select").addEventListener("change", function() {
  updateScores(this.value)
})

function updateScores(mode) {
  const scoreList = document.getElementById("scoreList")
  const list = scoreList.querySelectorAll(".sidebar-item, .sidebar-text");

  // Remove all currently displayed scores
  for (const item of list) {
    item.remove()
  }

  for (const region in regions) {
    var newListItem = document.createElement("li")
    newListItem.classList.add("sidebar-item")

    var newAnchor = document.createElement("a")
    newAnchor.classList.add("sidebar-text")
    newAnchor.textContent = regions[region].replaceAll("_", " ")
    

    if (localStorage[regions[region] + mode]) {
      var scoreArray = JSON.parse(localStorage[regions[region] + mode])
      var sum = 0;
      for (var i = 0; i < scoreArray.length; i++) {
        sum += Number(scoreArray[i])
      }
      newAnchor.textContent += ": " + Math.round(sum / scoreArray.length) + "%"
    } else {
      newAnchor.textContent += ": 0%"
      newAnchor.classList.add("locked-text")
    }

    newListItem.appendChild(newAnchor)
    scoreList.appendChild(newListItem)
  }
}

updateScores(gameMode)
// saveScore("North_America", "Countries", "12")
  
function saveScore(region, mode, score) {
  
  var scoreArray = []

  if (localStorage.getItem(region + mode) == null) {
    scoreArray.push(score)
    localStorage.setItem(region + mode, JSON.stringify(scoreArray))
    return
  }
  
  scoreArray = JSON.parse(localStorage[region + mode])

  if (scoreArray.length < maxScores) {
    scoreArray.push(score)
  } else {
    scoreArray.shift()
    scoreArray.push(score)
  }

  localStorage.setItem(region + mode, JSON.stringify(scoreArray))
}

function displayScore() {
  modal.show()
}

// https://stackoverflow.com/questions/13939573/how-to-add-spaces-between-array-items-javascript
// excludedContriesMessage = document.getElementById('excluded-countries-message')
// excludedContriesMessage.textContent = "Excluded Countries: " + excludedContries.join(', ')

window.switchMode = (btn) => {
  // Find other way to switch modes without a bunch of conditionals
  if (selectedRegion == null) {
    gameMode = btn.innerText
    // Gray out other options
    buttons = document.getElementsByClassName("mode-switch-btn")

    for (const button of buttons) {
      button.classList.remove("disabled-btn")
    }
    btn.classList.add("disabled-btn")
  } 
}

function saveGameState() {
  var object = {
    'randomCountry': randomCountry,
    'clicks': clicks,
    'correctAnswers': correctAnswers,
    'mistakes': mistakes,
    'clickedCountries': clickedCountries
  }
  localStorage.setItem('game' + selectedRegion + gameMode, JSON.stringify(object)
 )
}

function greyCountries(list, dclass) {
  d3.selectAll("." + dclass).filter(d => list.includes(d.properties.name))
    .transition()
    .style("fill", "#d6d6d6");
}

// d parameter explanation https://stackoverflow.com/questions/24358842/use-of-d-in-function-literal-in-d3
function handleClick(event, d) {
  var dclass = d3.select(this).attr("class");

  // Error with Carribean
  var countryCount = countries.filter(function() {return d3.select(this).classed(dclass);})["_groups"][0].length
  console.log(countries.filter(function() {return d3.select(this).classed(dclass);}))

  if (selectedRegion == null) {
    selectedRegion = dclass
    zoomContinent(d, dclass);

    // Reset variables
    mistakes = 0;
    clicks = 0;
    correctAnswers = 0;
    clickedCountries = [];

    // Check if there is country info saved (delete on FINISH and QUIT)
    var gameSave = localStorage.getItem('game' + selectedRegion + gameMode)
    // Make it do it only once when in game
    // Make sure to gray out all clicked countries''?
    if (gameSave) {
      var rtr = JSON.parse(gameSave)

      mistakes = rtr['mistakes']
      clicks = rtr['clicks']
      correctAnswers = rtr['correctAnswers']
      clickedCountries = rtr['clickedCountries']
      randomCountry = rtr['randomCountry']

      greyCountries(clickedCountries, dclass)
    }

    randomCountryDatum = countries.filter(function() {return d3.select(this).attr("id") === randomCountry}).datum()

    if (gameMode === "Countries") {
      clickOnText
        .attr("x", width / 2)
        .transition().style("opacity", 1).text("Click On: " + randomCountry)
      flag
        .attr("x", width - flagWidth - flagOffset)
        .attr("xlink:href", "static/country_flags/" + (randomCountryDatum.properties.iso_a2_eh).toLowerCase() + ".svg")
        .transition().style("opacity", 1)
    } else if (gameMode === "Flags") {
      clickOnText
        .attr("x", width / 2 - 80)
        .transition().style("opacity", 1).text("Click On: ")
      flag
        .attr("x", width / 2 - flagWidth / 2)
        .attr("xlink:href", "static/country_flags/" + (randomCountryDatum.properties.iso_a2_eh).toLowerCase() + ".svg")
        .transition().style("opacity", 1)
    } else if (gameMode === "Capitals") {
      var countryObject = countryDetails.find(object => object.alpha2Code === randomCountryDatum.properties.iso_a2_eh) // Find vs filter

      flag
        .attr("opacity", 0)
      clickOnText
        .attr("x", width / 2)
        .transition().style("opacity", 1).text("Click on the Country of: " + countryObject.capital)
    }

    score = Math.round(correctAnswers / clicks * 100);
    if (isNaN(score)) {
      score = 0;
    }
    scoreUI.text(correctAnswers + " / " + countryCount + " | " + score + "%")
      .transition().style("opacity", 1)
  
    return; 
  } 

  if (clickedCountries.includes(d.properties.name)) {
    return; 
  } 

  if (!(dclass.replaceAll(" ", "_") === selectedRegion)){
    return;
  } 

  // Incorrect Answer
  if (!(d.properties.name === randomCountry)) {
    d3.select(this)
      .transition().style("fill", "#ff1100ff").transition().duration(500).style("fill", colorSubregions);
    labels.filter((function() {return d3.select(this).text() === d.properties.name;}))
      .transition().style("opacity", 1).transition().duration(2000).style("opacity", 0);
    labelBoxes.filter((function() {return d3.select(this).attr("id") === d.properties.name;}))
      .transition().style("opacity", 1).transition().duration(2000).style("opacity", 0);
      
    mistakes++
    clicks++
    score = Math.round(correctAnswers / clicks * 100)

    scoreUI.text(correctAnswers + " / " + countryCount + " | " + score + "%")

    // Hightlight correct country after # of mistakes
    if (mistakes > 3 - 1) { 
      countries.filter(function() {return d3.select(this).attr("id") === randomCountry})
        .transition().style("fill", "red").transition().duration(2000).style("fill", colorSubregions);

      smallCountriesOutlines.filter(function() {return d3.select(this).attr("id") === randomCountry})
        .transition().style("fill", "red").transition().duration(2000).style("fill", colorSubregions);
        
      map.append("circle")
        .attr("cx", function() {
          var match = countries.filter(function() {return d3.select(this).attr("id") === randomCountry})
          return path.centroid(match.datum())[0]
        })
        .attr("cy", function() {
          var match = countries.filter(function() {return d3.select(this).attr("id") === randomCountry})
          return path.centroid(match.datum())[1]
        })
        .attr("r", 100)
        .style("fill", "white")
        .style("fill-opacity", 0.5)
        .style("stroke", "#c8c8c8ff")
        .style("stroke-width", 1.5)
        .transition().duration(2000).attr("r", 0).style("opacity", 0).remove();
    }
    return
  }
  // Game End: All Countries CLicked
  if (clickedCountries.length == countryCount - 1) {
    scoreText.textContent = score + "%"
    regionText.textContent = selectedRegion.replaceAll("_", " ")
    modeText.textContent = gameMode
    saveScore(dclass, gameMode, score.toString())
    if (document.getElementById("score-mode-select").value === gameMode) {
      updateScores(gameMode)
    }
    gameEnded = true;
    // Delete saved game info
    localStorage.removeItem('game' + selectedRegion + gameMode);
    reset()
    setTimeout(displayScore(), 750)
    return;
  }

  // Randomize country
  clickedCountries.push(d.properties.name)
  getRandom(dclass)
  
  // Update Variables
  mistakes = 0
  clicks++
  correctAnswers++
  score = Math.round(correctAnswers / clicks * 100)
  
  d3.selectAll("." + dclass).filter(object => object.properties.name === d.properties.name)
    .transition().style("fill", "#d6d6d6");

  labels.filter((function() {return d3.select(this).text() === d.properties.name;}))
    .transition().style("opacity", 1).transition().duration(2000).style("opacity", 0);
  labelBoxes.filter((function() {return d3.select(this).attr("id") === d.properties.name;}))
    .transition().style("opacity", 1).transition().duration(2000).style("opacity", 0);

  // Update Ui
  randomCountryDatum = countries.filter(function() {return d3.select(this).attr("id") === randomCountry}).datum()
  if (gameMode === "Countries") {
    clickOnText.text("Click On: " + randomCountry)
    flag.attr("xlink:href", "static/country_flags/" + (randomCountryDatum.properties.iso_a2_eh).toLowerCase() + ".svg")
  } else if (gameMode === "Flags") {
    flag.attr("xlink:href", "static/country_flags/" + (randomCountryDatum.properties.iso_a2_eh).toLowerCase() + ".svg")
  } else if (gameMode === "Capitals") {
    var countryObject = countryDetails.find(object => object.alpha2Code === randomCountryDatum.properties.iso_a2_eh) // Find vs filter

    clickOnText.transition().style("opacity", 1).text("Click on the Country of: " + countryObject.capital)
  }
  scoreUI.text(correctAnswers + " / " + countryCount + " | " + score + "%")
}  

function handleMouseOver(event, d) {
  var dclass = d3.select(this).attr("class");
  
  if (selectedRegion == null) {
    d3.selectAll("." + dclass).style("opacity", "0.7");
  } else {
    if (dclass === selectedRegion){
      if (clickedCountries.includes(d.properties.name)) {
        return;
      }
      d3.select(this).style("opacity", "0.7"); 
    }
  }
}

function handleMouseOut(event, d) {
  var dclass = d3.select(this).attr("class");

  if (selectedRegion == null) {
    d3.selectAll("." + dclass).style("opacity", "1");
  } else {
    if (dclass === selectedRegion){
      if (clickedCountries.includes(d.properties.name)) {
        return;
      }
      d3.select(this).style("opacity", "1"); 
    }
  }
}

function quitGame() {
  localStorage.removeItem('game' + selectedRegion + gameMode);
  reset();
}

function reset() {
  if (selectedRegion == null) {
    console.log(selectedRegion)
    return;
  }

  // Reset variables
  selectedRegion = null;
  // clickedCountries = [];
  // clicks = 0
  // correctAnswers = 0
  // mistakes = 0

  // Style UI
  flag.transition()
    .style("opacity", 0)
  // quizBar.transition()
  //   .style("opacity", 0)
  clickOnText.transition()
    .text(clickOnTextContent)
    .style("opacity", 1)
  scoreUI.transition()
    .style("opacity", 0)
  countries.transition()
    .style("fill", function(d){return myColor(d3.select(this).attr("class")) })
    .style("stroke", "black")
    .style("opacity", 1) // Account for mouseout/over greycountries glitch
  smallCountriesOutlines.transition()
    .style("opacity", "1")
    .style("fill", function(d){return myColor(d3.select(this).attr("class")) })
  custom.transition()
    .style("opacity", "1")
    .style("fill", function(d){return myColor(d3.select(this).attr("class")) })
  resetButton.transition().style("opacity", "0")
    .style("cursor", "default")
  quitButton
    .transition().style("opacity", 0)
    .style("cursor", "default")

  if (labelsShown) {
	  labels.transition().duration(0)
    labels.style("opacity", 1)
	  labelBoxes.transition().duration(0)
    labelBoxes.style('opacity', 1)
  }

  d3.select("#ClickCountryText")
    .text("")

  svg.transition().duration(500).call(
      zoom.transform,
      d3.zoomIdentity,
      d3.zoomTransform(svg.node()).invert([width / 2, height / 2]))
}

function zoomContinent(d, dclass) {
  countries.filter(function() {return d3.select(this).classed(dclass);})
    .transition().style("fill", colorSubregions)
    .style("opacity", "1")
  smallCountriesOutlines.filter(function() {return !d3.select(this).classed(dclass);})
    .transition().style("opacity", "0")
  smallCountriesOutlines.filter(function() {return d3.select(this).classed(dclass);}) 
    .transition().style("fill", colorSubregions)
  custom.filter(function() {return d3.select(this).classed(dclass);}) 
    .transition().style("fill", colorSubregions)
  custom.filter(function() {return !d3.select(this).classed(dclass);})
    .transition().style("opacity", "0")
  countries.filter(function() {return !d3.select(this).classed(dclass);})
    .transition().style("fill", "#999694")
    .style("stroke", "#999694") 
  resetButton
    .transition().style("opacity", "1")
    .style("cursor", "pointer") // https://www.w3schools.com/cssref/tryit.php?filename=trycss_cursor
  quitButton
    .transition().style("opacity", 1)
    .style("cursor", "pointer")
  quizBar.transition()
    .style("opacity", 0.75)

  getRandom(dclass)
    
  const [[x0, y0], [x1, y1]] = getBounds(dclass)
  svg.transition().duration(1000).call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
  ); // Remove outliers for countries in continent group. Get bounding box for selection, zoom and scale appropriately to region
}

function getRandom(dclass) {
  var region = d3.selectAll("." + dclass)["_groups"][0]
  var regionCountries = [];

  for (var i = 0; i < region.length; i++) {
    if (clickedCountries.includes(region[i]["__data__"]["properties"]["name"])) {
      // console.log("AMAZING" + region[i]["__data__"]["properties"]["name"])
      continue;
    }
    regionCountries.push(region[i]["__data__"]["properties"]["name"])
  }
  
  var random = Math.floor(Math.random() * regionCountries.length);
  console.log("Random Country Is " + regionCountries[random]) // it get rid of everything except last country clicked, which is why its rare
  randomCountry = regionCountries[random]
}

// Custom bounds for country zoom
const regionBounds = [
  {
    "region": "North_America",
    "x": 150,
    "y": 10,
    "width": 275,
    "height": 225
  },
  {
    "region": "Europe",
    "x": 425,
    "y": 15,
    "width": 200,
    "height": 125
  },
  {
    "region": "Oceania",
    "x": 770,
    "y": 250,
    "width": 190,
    "height": 170
  }
]

// Get the bounds of a region
function getBounds(dclass) {
  var xvalues = [];
  var yvalues = [];
  var boundbox = [];
  
  var region = d3.selectAll("." + dclass)["_groups"][0]
  // region[i]["__data__"]["properties"]["continent"]

  
  for (var k = 0; k < regionBounds.length; k++) {
    if (regionBounds[k]["region"] === dclass) {
      boundbox.push([regionBounds[k]["x"], regionBounds[k]["y"]], [(regionBounds[k]["x"] 
        + regionBounds[k]["width"]), (regionBounds[k]["y"] + regionBounds[k]["height"])])
      return boundbox;
    }
  }

  for (var i = 0; i < region.length; i++) {
    var bounds = region[i].getBBox()
    
    xvalues.push(bounds.x, bounds.x + bounds.width)
    yvalues.push(bounds.y, bounds.y + bounds.height)
  }
  boundbox.push([Math.min(...xvalues), Math.min(...yvalues)], [Math.max(...xvalues), Math.max(...yvalues)])
  console.log(boundbox)
  return boundbox;
}

const zoom = d3.zoom()
  .scaleExtent([1, 30])
  .translateExtent([[0, 0], [width, height]])
	.on('zoom', handleZoom)
  //   .filter((event) => {
  //   // keep wheel zoom 
  //   if (event.type === 'wheel') return true;

  //   if (event.type === 'mousedown' || event.type === 'pointerdown') {
  //     return event.button === 2; // 0=left, 1=middle, 2=right
  //   }
  // })

function handleZoom(event) {
		map.attr('transform', event.transform);
}
console.log('seperate')
console.log(smallCountries.map(obj => obj['properties']['name']))
svg.call(zoom)
});
