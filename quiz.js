const inputBox = document.getElementById('user-input');

function start(mode) {
    // Zero variables

    // Create curated copy of country pool

    // Get random country (set save)

    // Set flag to random country

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

    for (const word of wordparts) {
        var sliced = word.slice(0, val.length).toLowerCase()

        if (sliced === val && sliced.length != word.length) {
            // Create css
            console.log(sliced.toUpperCase() + word.slice(val.length))
        }
    }
})
