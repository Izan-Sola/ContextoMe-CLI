const readline = require('readline');
const GameApi = require('./contextoAPI.js');
const { getContextoGameId } = require('./getGameId.js');

const LANGUAGE = 'en';

let GAME = [];
let entries = new Map();
let GUESS = "";
let filledGuess = "";
let DISTANCE = "3";
let RANK = null;

const IGNORED_KEYS = [ 'tab', 'backspace']
async function main() {
    try {
        const GAME_ID = await getContextoGameId();
        
        if (!GAME_ID) {
            console.error('Failed to get game ID');
            process.exit(1);
        }
        GAME.push(`\n\tStarting game...`);
        GAME[0] = `\n \t╔════( Welcome to Contexto CLI. Game ID: ${GAME_ID} )════╗`;
        GAME.push(`\t║¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯║`);
        GAME.push(`\t║          |                            |           ║`)
        GAME.push(`\t║          |¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯|           ║`)

        const api = GameApi(LANGUAGE, GAME_ID.replace('#', ''));
        readline.emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY) process.stdin.setRawMode(true);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        drawTable();

        async function playWord(word) {
                try {
                    const res = await api.play(word);

                    if (res.rank === 1) {
                        console.log('\nYOU WIN!');
                        console.log(`The word was: ${word}`);
                        console.log(`Guesses: ${res.rank}`);
                        rl.close();
                    } else {
                        DISTANCE = res.distance;
                        RANK = res.rank;
                        
                        let maxEntryWidth = 27; 
                        let fill = maxEntryWidth - (word.length + DISTANCE.toString().length + 1);
               
                        entries.set(Number(DISTANCE), `\t║          | ${word}${" ".repeat(fill)}${DISTANCE.toString()} |           ║`);
                        drawTable(true);
                    }
                } catch (error) {
                    console.log('Invalid word or request failed sldkngg');
                }
        }

        process.stdin.on('keypress', (str, key) => {
            if (key.name === 'return') {
                    playWord(GUESS)
                    GUESS="";
                    return;
            } else if ( key.name === 'backspace') {
                GUESS = GUESS.slice(0, -1);
            } else if (key.name.length == 1 && /^[a-zA-Z]$/.test(key.name)) {
                GUESS += key.name;
            }

            let maxLength = 27;
            if(GUESS.length > maxLength) GUESS = GUESS.slice(0, maxLength);
            
            filledGuess = GUESS.padEnd(maxLength, " ");
            GAME[2] = `\t║          | ${filledGuess}|           ║`;
            drawTable();
        });

        rl.on('close', () => {
            console.log('\n bye ');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

function drawTable(playedWord) {
    console.clear();

    GAME.forEach(line => {
        console.log(line)
    });

    const sortedEntries = [...entries.entries()].sort((a, b) => a[0] - b[0]);
    
    sortedEntries.forEach(([key, value]) => {
        console.log(value);
    });
    
    console.log(`\t╚═══════════════════════════════════════════════════╝`)
}
main();