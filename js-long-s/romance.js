/*
js-long-s/romance.js
by TravisGK
---
this file contains the functions necessary to convert words in romantic languages
so that they use the archaeic letter called the long S (ſ).
although English is a germanic language, it's rules are regular enough to be
facilitated by code already in this file, so it's conversion function is here.
*/

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function romanceConversion(
    text,
    mainPattern,
    exclusionPattern=null, 
    ssiUsesDoubleSS=true,
) {
    // this func returns text that uses the long s.
    let cleanText = removeAccents(text);

    // finds the indices of the letter S that follow the given pattern.
    let match;
    let indices = [];
    while ((match = mainPattern.exec(cleanText)) !== null) {
        indices.push(match.index);
    }

    // filters out excluded indices.
    if (exclusionPattern !== null) {
        let excludedIndices = [];
        while ((match = exclusionPattern.exec(cleanText)) !== null) {
            excludedIndices.push(match.index);
        }
        indices = indices.filter(i => !excludedIndices.includes(i));
    }

    indices.forEach(i => {
        text = text.substring(0, i) + "ſ" + text.substring(i + 1);
    });

    if (ssiUsesDoubleSS) {
        return text;
    }
    
    const pattern = /ſſi/g;
    text = text.replace(pattern, "ſsi");
    return text;
}

function englishConversion(text) {
    const ROUND_S_BEFORE_BK = false; // true in 17th and early 18th century.

    let mainPattern;
    if (ROUND_S_BEFORE_BK) {
        mainPattern = /s(?=[a-ac-jm-zA-AC-JM-Z])/g;
    } else {
        mainPattern = /s(?=[a-zA-Z])/g;
    }
    let exclusionPattern = /ss(?=f|F)|(?<=f|F)s/g;
    text = romanceConversion(text, mainPattern, exclusionPattern);

    let pattern = /ſſſ/g;
    text = text.replace(pattern, "ſsſ");
    
    return [
        text, // converted text.
        true, // if any replacement is made.
        true,  // if any fancy in-place replacements are needed
    ];
}

function spanishConversion(text) {
    const USE_LONG_S_BEFORE_ACCENTED_O = false;

    let mainPattern = /s(?=[a-ac-eg-gi-zA-AC-EG-GI-Z-—])/g;
    let exclusionPattern;
    if (USE_LONG_S_BEFORE_ACCENTED_O) {
        exclusionPattern = /s(?=[áàéèíìúùüÁÀÉÈÍÌÚÙÜ])/g;
    } else {
        exclusionPattern = /s(?=[áàéèíìóòúüÁÀÉÈÍÌÓÒÚÙÜ])/g;
    }

    text = romanceConversion(text, mainPattern, exclusionPattern, false);
    return [
        text, // converted text.
        true, // if any replacement is made.
        true,  // if any fancy in-place replacements are needed
    ];
}

function frenchConversion(text) {
    let mainPattern = /s(?=[a-ac-eg-gi-zA-AC-EG-GI-Z])/g;
    let exclusionPattern = null;
    text = romanceConversion(text, mainPattern, exclusionPattern);

    return [
        text, // converted text.
        true, // if any replacement is made.
        true,  // if any fancy in-place replacements are needed
    ];
}

function italianConversion(text) {
    const USE_DOUBLE_LONG_WITH_SSI = true;

    let mainPattern = /s(?=[a-ac-eg-zA-AC-EG-Z-—])/g;
    let exclusionPattern = /s(?=[áàéèíìóòúüÁÀÉÈÍÌÓÒÚÙÜ])/g;
    text = romanceConversion(
        text, mainPattern, exclusionPattern, USE_DOUBLE_LONG_WITH_SSI
    );

    return [
        text, // converted text.
        true, // if any replacement is made.
        true,  // if any fancy in-place replacements are needed
    ];
}