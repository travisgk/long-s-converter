function convertText() {
    const keepUnknownS = false;

    const inputText = document.getElementById("inputText").value;
    const langOption = document.getElementById("langOption").value;
    
    let outputText = inputText;
    let convertFunc = null;

    if (langOption === "en") {
        convertFunc = englishConversion;
    } else if (langOption === "es") {
        convertFunc = spanishConversion;
        //const result = spanishConversion(inputText);
        //outputText = result[0]; // modified text.
    } else if (langOption === "fr") {
        convertFunc = frenchConversion;
        // const result = frenchConversion(inputText);
        // outputText = result[0]; // modified text.
    } else if (langOption === "it") {
        convertFunc = italianConversion;
        // const result = italianConversion(inputText);
        // outputText = result[0]; // modified text.
    } else {
        outputText = "DE";
    }

    if (convertFunc !== null) {
        let results = splitStringWithIndices(inputText, langOption);
        for (let [i, oldWord] of results) {
            let [newWord, replacementMade, useFancyReplace] = convertFunc(oldWord);

            if (!replacementMade) {
                continue;
            }

            if (!useFancyReplace) {
                outputText = outputText.substring(0, i) + newWord + outputText.substring(i + newWord.length);
            } else {
                if (!keepUnknownS) {
                    newWord = newWord.replace(/X/g, "ſ"); // replaces UNKNOWN_S with long s
                }

                for (let j = 0; j < newWord.length; j++) {
                    if (outputText[i + j] === "s") {
                        outputText = outputText.substring(0, i + j) + newWord[j] + outputText.substring(i + j + 1);
                    }
                }
            }
        }
    }


    document.getElementById("outputText").innerText = outputText;
}