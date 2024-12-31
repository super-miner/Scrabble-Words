const readline = require('node:readline');
const fs = require('fs');
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const numLetters = 7;

const letterMap = 'AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const main = () => {
    let foundLetters = false;
    let letters;
    while (!foundLetters) {
        letters = generateLetters();
        if (findLongestWord(letters).length == 7) {
            foundLetters = true;
        }
    }

    console.log('');
    console.log(letters.join(' '));

    question(letters);
}

const question = async (letters) => {
    rl.question('Enter the longest word you can make: ', async (word) => {
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
            let longestWord = findLongestWord(letters);
            if (formattedWord.length == longestWord.length) {
                console.log(formattedWord + ' is THE BEST word.');
            }
            else {
                let definition = await getDefinition(longestWord);
                console.log(formattedWord + ' is a valid word.');
                console.log('');
                console.log(longestWord + ' was the longest possible word with those letters');
                console.log(definition);
            }
            main();
        }

        //rl.close();
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
