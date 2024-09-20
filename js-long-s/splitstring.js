function isLetter(char) {
    // returns true if the given character is a letter.
    const category = char.codePointAt(0);
    return (category >= 0x0041 && category <= 0x005A) || // A-Z.
           (category >= 0x0061 && category <= 0x007A) || // a-z.
           (category >= 0x00C0 && category <= 0x00FF); // accented letters (Lat-1).
}

function splitStringWithIndices(inputString, lang) {
    const APOSTROPHES = "'";
    const results = [];
    const regex = /\S+/g; // matches non-whitespace sequences.

    // uses regex to find all matches in the input string.
    let match;
    while ((match = regex.exec(inputString)) !== null) {
        let index = match.index;
        let word = match[0];

        // finds the first letter of the word.
        let localStartIndex = 0;
        for (let i = 0; i < word.length; i++) {
            if (isLetter(word[i])) {
                localStartIndex = i;
                break;
            }
        }

        if (localStartIndex === word.length) continue; // no letters found.

        let localEndIndex = word.length - 1;
        if (lang === "de") {
            // if German, it considers apostrophes for ending index.
            for (let i = word.length - 1; i >= 0; i--) {
                if (isLetter(word[i]) || word[i] === APOSTROPHES) {
                    localEndIndex = i;
                    break;
                }
            }
        } else {
            // for other languages, it only considers letters for ending index.
            for (let i = word.length - 1; i >= 0; i--) {
                if (isLetter(word[i])) {
                    localEndIndex = i;
                    break;
                }
            }
        }

        index += localStartIndex;
        word = word.substring(localStartIndex, localEndIndex + 1);
        results.push([index, word]);
    }

    return results;
}
