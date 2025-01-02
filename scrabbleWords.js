const readline = require('node:readline');
const fs = require('fs');
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const numLetters = 7;

const letterMap = 'AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ';
const letterScores = {
    'A': 1,
    'B': 3,
    'C': 3,
    'D': 2,
    'E': 1,
    'F': 4,
    'G': 2,
    'H': 4,
    'I': 1,
    'J': 8,
    'K': 5,
    'L': 1,
    'M': 3,
    'N': 1,
    'O': 1,
    'P': 3,
    'Q': 10,
    'R': 1,
    'S': 1,
    'T': 1,
    'U': 1,
    'V': 4,
    'W': 4,
    'X': 8,
    'Y': 4,
    'Z': 10
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const main = () => {
    let foundLetters = false;
    let letters;
    while (!foundLetters) {
        letters = generateLetters();
        if (findLongestWord(letters).length > 0) {
            foundLetters = true;
        }
    }

    console.log('');
    console.log(letters.join(' '));

    question(letters);
}

const question = async (letters) => {
    rl.question('Enter the highest scoring word you can make: ', async (word) => {
        let formattedWord = word.toUpperCase();

        if (!isWordValidLetters(letters, formattedWord)) {
            console.log(formattedWord + ' uses invalid letters.');
            console.log('');
            question(letters);
        }
        else if (!isWordValid(formattedWord)) {
            console.log(formattedWord + ' is NOT a valid word.');
            console.log('');
            question(letters);
        }
        else {
            let bestWord = findBestWord(letters);
            if (getScore(formattedWord) == getScore(bestWord)) {
                console.log(formattedWord + ' is THE BEST word (' + getScore(formattedWord) + ' points).');
            }
            else {
                let definition = await getDefinition(bestWord);
                console.log(formattedWord + ' is a valid word (' + getScore(formattedWord) + ' points).');
                console.log('');
                console.log(bestWord + ' was the best possible word with those letters (' + getScore(bestWord) + ' points):');
                console.log(definition);
            }
            main();
        }
    });
}

const generateLetters = () => {
    let output = [];

    for (let i = 0; i < numLetters; i++) {
        output.push(letterMap.charAt(Math.floor(Math.random() * letterMap.length)));
    }

    return output;
}

const loadDictionary = (path) => {
    let file = fs.readFileSync(path, 'utf8');
    return file.toString().split('\r\n');
}

const isWordValid = (word) => {
    return dictionary.includes(word);
}

const isWordValidLetters = (letters, word) => {
    let theLetters = [...letters];

    for (let i = 0; i < word.length; i++) {
        let char = word.charAt(i);

        if (theLetters.includes(char)) {
            let index = theLetters.indexOf(char);
            theLetters.splice(index, 1);
        }
        else {
            return false;
        }
    }

    return true;
}

const findLongestWord = (letters) => {
    let longestLength = 0;
    let longestWord = '';

    for (let i = 0; i < dictionary.length; i++) {
        let word = dictionary[i];

        if (word.length <= longestLength || word.length > numLetters) {
            continue;
        }

        if (isWordValidLetters(letters, word)) {
            longestLength = word.length;
            longestWord = word;
        }
    }

    return longestWord;
}

const getScore = (word) => {
    let sum = 0;

    for (let i = 0; i < word.length; i++) {
        let char = word.charAt(i);

        sum += letterScores[char];
    }

    return sum;
}

const findBestWord = (letters) => {
    let bestScore = 0;
    let bestWord = '';

    for (let i = 0; i < dictionary.length; i++) {
        let word = dictionary[i];

        if (word.length > numLetters) {
            continue;
        }

        let score = getScore(word);

        if (score <= bestScore) {
            continue;
        }

        if (isWordValidLetters(letters, word)) {
            bestScore = score;
            bestWord = word;
        }
    }

    return bestWord;
}

const getDefinition = async (word) => {
    let response = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + word);
    let text = await response.text();
    let data = JSON.parse(text);

    if (data.title == 'No Definitions Found') {
        return 'No definition';
    }

    return data[0].meanings[0].definitions[0].definition;
}

const dictionary = loadDictionary('TWL06.txt');

main();
