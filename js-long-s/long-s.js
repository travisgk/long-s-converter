/**
Filename: long-s.js
Description: js-long-s is a tool that takes modern text and 
             inserts the archaic letter of the long S (ſ) where it fits.

Author: TravisGK
Version: 1.0

License: MIT License
*/

function getConversionFunc(lang) {
    /** Returns the conversion function used for a particular language. */
    switch (lang) {
        case "en":
            return convertEnglishWord;
        case "fr":
            return convertFrenchWord;
        case "de":
            return convertGermanWord;
        case "es":
            return convertSpanishWord;
        case "it":
            return convertItalianWord;
        default:
            return null;
    }
}


function convertText(text, langOption, keepUnknownS) {
    /**
    Places the long s (ſ) in a sentence and returns it.
     
    Parameters:
    text (string): the string to convert into archaic spelling.
    lang (string): the language code for <text>. "en", "es", "fr", "it", or "de".
    keepUnknownS (boolean): if true, ambiguous cases of S will be shown as X.
     
    Returns:
    string: text with the long s (ſ) placed.
    */

    const convertFunc = getConversionFunc(langOption);

    if (convertFunc === null) {
        console.log(`language "${lang}" not found. The options are: en, es, fr, it, de.`);
        return text;
    }

    const wordsWithIndices = _splitStringWithIndices(text, langOption);

    // converts each word individually.
    for (const [oldWord, startIndex] of wordsWithIndices) {
        const newWord = convertFunc(oldWord);
        
        if (oldWord !== newWord) {
            text = text.slice(0, startIndex) + newWord + text.slice(startIndex + newWord.length);
        }
    }
    
    return text;
}