/**
Filename: germanconversion.js
Description: This contains the complex function that inserts the long S
             into the German language.

Author: TravisGK
Version: 1.0.2

License: MIT License
*/

const UNKNOWN_S = 'φ';


function _stripToGermanAlphabet(word) {
    /**
     * Returns text with any accent marks removed (besides umlauts).
     * If there's an issue due to a foreign character
     * (i.e. one character becomes two),
     * then the word is just returned.
     */
    let result = "";
    const noAccents = _stripAccents(word);

    if (word.length !== noAccents.length) {
        return word;
    }

    for (let i = 0; i < noAccents.length; i++) {
        const nChar = noAccents[i];
        if ("AÄEIOÖUÜYaäeioöuüy".includes(word[i])) {
            result += word[i];
        } else {
            result += nChar;
        }
    }

    return result;
}


function cartesianProduct(arr) {
    /**
    This helper function generates a cartesian product 
    (equivalent of itertools.product) and returns it.
    */
    return arr.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
}


function escapeRegex(string) {
    /** This helper function is used to escape regex special characters. */
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


function _crosswordReplace(text, spellingPattern) {
    /**
    This function fills in ambiguous cases of the letter S
    by using a given spelling pattern.

    The spelling pattern is actually the replacement term,
    while the search terms are generated by taking
    the spelling pattern and creating every possible spelling combination
    where any letter "s" or "ſ" will be swapped with an UNKNOWN S;
    all of these search terms will always have at least one UNKNOWN S.

    The way this function works is analogous to filling in a crossword:
    the program recognizes where patterns can "fit" into the blanks.

    Parameters:
    text (string): the text to be searched and possibly modified.
    spelling_pattern (string): the replacement term.

    Returns:
    string: text with replacements applied (if any).
    bool: whether a replacement was made.
    */

    if (spellingPattern.length > text.length) {
        return [text, false];
    }

    const options = [...spellingPattern].map(
        c => (c === 'ſ' || c === 's') ? [c, UNKNOWN_S] : [c]
    );
    const combos = cartesianProduct(options);
    const possibleTerms = combos.filter(
        combo => combo.includes(UNKNOWN_S)).map(combo => combo.join('')
    );

    let oldText = text;
    for (let possibleTerm of possibleTerms) {
        text = text.replace(possibleTerm, spellingPattern);
    }

    return [text, text !== oldText];
}


function _blueprintReplace(text, blueprintText, spellingPattern) {
    /**
    Returns text with a spelling pattern enforced
    and if any replacements were made.
    */

    const patternWithoutLongS = spellingPattern.replace(/ſ/g, 's');
    const matchedIndices = [
        ...blueprintText.matchAll(
            new RegExp(escapeRegex(patternWithoutLongS), 'g')
        )
    ].map(m => m.index);

    for (let index of matchedIndices) {
        const endIndex = index + spellingPattern.length;
        text = text.slice(0, index) + spellingPattern + text.slice(endIndex);
    }

    return [text, matchedIndices.length > 0];
}


function _fillInDoubleS(word) {
    /** Returns the word with a basic pattern with double S filled in.*/
    word = word.replace(`${UNKNOWN_S}s`, 'ſs');
    word = word.replace(`s${UNKNOWN_S}`, 'sſ');
    return word;
}


function _findBlankIndices(word) {
    /** Returns a list of indices where any UNKNOWN_S remains in the word.*/
    return [...word].map(
        (c, i) => c === UNKNOWN_S ? i : null).filter(i => i !== null
    );
}


function _applyTestException(text, originallyCapitalized) {
    /**
    Returns the given word with a particular pattern applied.
    if the given word was originally capitalized, then it's a noun
    and the pattern "ſteſt" will become "steſt".
    */
    if (!originallyCapitalized) {
        return text;
    }
    return text.replace(/ſteſt/g, "steſt");
}


function convertGermanWord(word) {
    /** Returns German text with the long S (ſ) placed appropriately. */
    const DEFAULT_UNKNOWNS_TO_LONG_S = true;  // True by default.
    const FORCE_SHORT_S_BEFORE_Z = false;  // False after 1901.
    const PRINT_DEBUG_TEXT = false;

    /**
    Step 1)
    ---
    The program has the conversions of some commonly-used
    words and names explicitly written in memory, 
    so if the word is one of those,
    the function will return that conversion immediately.

    */
    if (PRINT_DEBUG_TEXT) {
        console.log(`Begins) ${word}`);
        console.log("Step 1)");
    }

    let backupWord = word;
    let cleanWord = _stripToGermanAlphabet(word.toLowerCase());

    // matches list are indexed by the starting letter.
    const exactMatchesList = EXACT_MATCHES[cleanWord[0]];
    if (exactMatchesList) {
        for (let term of exactMatchesList) {
            const noLongS = term.replace(/ſ/g, 's');
            if (cleanWord === noLongS) {
                word = _transferLongS(term, word);
                if (PRINT_DEBUG_TEXT) 
                    console.log(`\t${word}`);
                return word;
            }
        }
    }

    // checks to see if this word is actually a name or a name + "s".
    const namesList = LONG_S_NAMES[cleanWord[0]]
    if (namesList) {
        for (let term of namesList) {
            if (
                (cleanWord.slice(-1) === "s" && cleanWord.slice(0, -1) === term) 
                || cleanWord === term
            ) {
                // this is a name that
                // has all intermittent occurences of S being long.
                cleanWord = (
                    cleanWord.slice(0, -1).replace(/s/g, 'ſ') 
                    + cleanWord.slice(-1)
                );
                word = _transferLongS(cleanWord, word);
                if (PRINT_DEBUG_TEXT) 
                    console.log(`\t${word}`);
                return word;
            }
        }
    }

    // saves a copy of the word to use for indexing and forced replacements.
    let blueprintWord = cleanWord;
    cleanWord = (
        cleanWord.slice(0, -1).replace(/s/g, UNKNOWN_S) 
        + cleanWord.slice(-1)
    );
  
    /**
    Step 2a)
    ---
    This step enforces a few exceptional spellings.

    */
    for (let term of FORCED_OVERWRITES) {
        if (term.length <= cleanWord.length) {
            [cleanWord, madeReplacement] = _blueprintReplace(
                cleanWord, blueprintWord, term
            );
            if (madeReplacement) {
                cleanWord = _fillInDoubleS(cleanWord);
                // can't break here b/c search is omnipresent.
            }
        }
    }

    if (cleanWord.startsWith(UNKNOWN_S)) {
        // S as the first letter in a word is always long.
        cleanWord = 'ſ' + cleanWord.slice(1);
    }

    if (cleanWord.length > 1 && cleanWord[cleanWord.length - 2] === UNKNOWN_S) {
        // the penultimate S is almost always long.
        if (cleanWord[cleanWord.length - 1] !== 'k') {
            cleanWord = cleanWord.slice(0, -2) + 'ſ' + cleanWord.slice(-1);
        } else {
            cleanWord = cleanWord.slice(0, -2) + 's' + cleanWord.slice(-1);
        }
    }

    cleanWord = _fillInDoubleS(cleanWord);
    let remainingBlankIndices = _findBlankIndices(cleanWord);

    if (!remainingBlankIndices.some(i => cleanWord[i] === UNKNOWN_S)) {
        // the word has been fully solved, so it's returned.
        let isUpper = backupWord.charAt(0) === backupWord.charAt(0).toUpperCase();
        cleanWord = _applyTestException(cleanWord, isUpper);
        word = _transferLongS(cleanWord, word);
        if (PRINT_DEBUG_TEXT)
            console.log(`\t${word}`);
        return word;
    }

    /**
    Step 2b) 
    ---
    This step applies basic patterns to try to solve any ambiguous S.
    
    */

    // determines which occurrences of S can't be explicitly decided as
    // being a short S (and thereby which ones must definitely be a short S).
    const pattern = FORCE_SHORT_S_BEFORE_Z
        ? `${UNKNOWN_S}(?=[aäceioöpſ${UNKNOWN_S}tuüy])`
        : `${UNKNOWN_S}(?=[aäceioöpſ${UNKNOWN_S}tuüyz])`;
    
    const uncertainIndices = [
        ...cleanWord.matchAll(new RegExp(pattern, 'g'))
    ].map(m => m.index);
    const certainShortSIndices = [...cleanWord].map(
        (c, i) => (c === UNKNOWN_S && !uncertainIndices.includes(i)) ? i : null
    ).filter(i => i !== null);

    // fills in any determined short S from the pattern.
    for (let index of certainShortSIndices) {
        cleanWord = cleanWord.slice(0, index) + 's' + cleanWord.slice(index + 1);
    }

    cleanWord = _fillInDoubleS(cleanWord);

    if (PRINT_DEBUG_TEXT)
        console.log(`Step 2)\t${word}`);

    /**
    Step 3) 
    ---
    This step uses the blueprint replace function to try to solve
    any ambiguous S, but only for patterns
    that occur at the end of words.

    */
    if (PRINT_DEBUG_TEXT)
        console.log("Step 3)");

    let endsList = null;
    if (blueprintWord.length >= 3) {
        endsList = END_PATTERNS[blueprintWord.slice(-3)];
    }
    if (!endsList && blueprintWord.length >= 2) {
        endsList = END_PATTERNS[blueprintWord.slice(-2)];
    }
    if (!endsList && blueprintWord.length >= 1) {
        endsList = END_PATTERNS[blueprintWord.slice(-1)];
    }

    if (endsList) {
        for (let term of endsList) {
            if (term.length <= cleanWord.length) {
                let cleanSnippet = cleanWord.slice(-term.length);
                let blueprintSnippet = blueprintWord.slice(-term.length);

                [cleanSnippet, madeReplacement] = _blueprintReplace(
                    cleanSnippet, blueprintSnippet, term
                );
                if (madeReplacement) {
                    if (PRINT_DEBUG_TEXT)
                        console.log(`END PATTERN:\t${term}`);
                    cleanWord = cleanWord.slice(0, -term.length) + cleanSnippet;
                    cleanWord = _fillInDoubleS(cleanWord);
                    break;
                }
            }
        }
    }

    /**
    Step 4)
    ---
    This step uses the crossword replace function to try to solve
    any ambiguous S. A dictionary of spelling patterns that can occur
    anywhere in the word are used to try to further solve the spelling.

    */
    if (PRINT_DEBUG_TEXT)
        console.log("Step 5)");

    // builds a list of replacement patterns
    // based on what letters the word is composed of.
    let isolatedKeys = [
        "ir", "nt", "er", "et", "en", "at", "r",
        "ea", "e", "n", "i", "a", "t", "h", "u", "o"
    ];

    let wordKeys = ["remaining"];
    isolatedKeys.forEach(key => {
        if ([...key].every(char => cleanWord.includes(char))) {
            wordKeys.push(key);
        }
    });

    let sCount = Math.min(2, (blueprintWord.match(/s/g) || []).length);
    let omnipresentPatterns = [];

    wordKeys.forEach(wordKey => {
        omnipresentPatterns = omnipresentPatterns.concat(
            OMNIPRESENT_PATTERNS[wordKey][sCount]
        );
        if (sCount === 2) {
            omnipresentPatterns = omnipresentPatterns.concat(
                OMNIPRESENT_PATTERNS[wordKey][1]
            );
        }
    });
    omnipresentPatterns.sort((a, b) => b.length - a.length);

    remainingBlankIndices = _findBlankIndices(cleanWord);
    for (let term of omnipresentPatterns) {
        // loops until no more unknowns remain.
        if (!remainingBlankIndices.some(i => cleanWord[i] === UNKNOWN_S)) break;
        [cleanWord, madeReplacement] = _crosswordReplace(cleanWord, term);
        if (madeReplacement) {
            if (PRINT_DEBUG_TEXT)
                console.log(`\tOMNIPRESENT PATTERN: ${term}`);
            cleanWord = _fillInDoubleS(cleanWord);
            remainingBlankIndices = _findBlankIndices(cleanWord);
        }
    }

    if (PRINT_DEBUG_TEXT)
        console.log(`\t\t${word}`);

    if (!remainingBlankIndices.some(i => cleanWord[i] === UNKNOWN_S)) {
        // the word has been fully solved, so it's returned.
        let isUpper = backupWord.charAt(0) === backupWord.charAt(0).toUpperCase();
        cleanWord = _applyTestException(cleanWord, isUpper);
        word = _transferLongS(cleanWord, word);
        if (PRINT_DEBUG_TEXT)
            console.log(`\t${word}`);
        return word;
    }

    /**
    Step 5)
    ---
    This step uses the crossword replace function to try to solve
    any ambiguous S, but only for patterns
    that occur at the beginning of words.

    */
    if (PRINT_DEBUG_TEXT)
        console.log("Step 6)");

    const startsList = START_PATTERNS[blueprintWord[0]];
    if (
        startsList
        && remainingBlankIndices.some(i => cleanWord[i] === UNKNOWN_S)
    ) {
        for (let term of startsList) {
            if (term.length <= cleanWord.length) {
                let cleanSnippet = cleanWord.slice(0, term.length);
                [cleanSnippet, madeReplacement] = _crosswordReplace(
                    cleanSnippet, term
                );
                if (madeReplacement) {
                    if (PRINT_DEBUG_TEXT)
                        console.log(`\tSTART PATTERN: ${term}`);
                    cleanWord = cleanSnippet + cleanWord.slice(term.length);
                    cleanWord = _fillInDoubleS(cleanWord);
                    break;
                }
            }
        }
    }

    if (PRINT_DEBUG_TEXT)
        console.log(`\t\t${word}`);

    /**
    Step 6)
    ---
    This step runs postprocess replacements with the crossword search.

    */
    for (let term of POSTPROCESS_PATTERNS) {
        if (!remainingBlankIndices.some(i => cleanWord[i] === UNKNOWN_S)) break;
        [cleanWord, madeReplacement] = _crosswordReplace(cleanWord, term);
        if (madeReplacement) {
            cleanWord = _fillInDoubleS(cleanWord);
        }
    }

    if (PRINT_DEBUG_TEXT)
        console.log(`Step 7)\t${word}`);
    
    /**
    Result) 
    ---
    The word is cleaned up and returned.

    */
    if (DEFAULT_UNKNOWNS_TO_LONG_S) {
        cleanWord = cleanWord.replace(new RegExp(UNKNOWN_S, 'g'), 'ſ');
    }

    let isUpper = backupWord.charAt(0) === backupWord.charAt(0).toUpperCase();
    cleanWord = _applyTestException(cleanWord, isUpper);

    if (PRINT_DEBUG_TEXT)
        console.log(`Result\t${word}`);

    return _transferLongS(cleanWord, word);
}
