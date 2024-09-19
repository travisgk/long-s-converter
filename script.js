function convertText() {
    // Get the text from the textarea
    const inputText = document.getElementById("inputText").value;
    
    // Get the selected option from the dropdown
    const langOption = document.getElementById("langOption").value;
    
    // Variable to hold the output
    let outputText = "";
    
    // Check what option was selected and perform the appropriate conversion
    if (langOption === "en") {
        outputText = "EN";
    } else if (langOption === "es") {
        outputText = "ES";
    } else if (langOption === "fr") {
        outputText = "FR";
    } else if (langOption === "it") {
        outputText = "IT";
    } else {
        outputText = "DE";
    }
    
    // Display the output text
    document.getElementById("outputText").innerText = outputText;
}
