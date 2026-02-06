const readline = require('readline');
const GameApi = require('./contextoAPI.js');
const { getContextoGameId } = require('./getGameId.js');

const LANGUAGE = 'en';

let GAME = []
let GUESS = ""
async function main() {
    try {
        // console.log("Getting today's game ID...");
        
        const GAME_ID = await getContextoGameId();
        
        if (!GAME_ID) {
            console.error('Failed to get game ID');
            process.exit(1);
        }
        GAME.push(`\n \t╔════( Welcome to Contexto CLI. Game ID: ${GAME_ID} )════╗`);
        GAME.push(`\t║¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯║`);
        GAME.push(`\t║          |                            |           ║`)

        const api = GameApi(LANGUAGE, GAME_ID.replace('#', ''));
        readline.emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY) process.stdin.setRawMode(true);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        drawTable();

        // console.log('Commands: :quit\n');

        // const ask = () => {
        //     rl.question('\t║                                                   ║', async (input) => {
        //         const word = input.trim().toLowerCase();

        //         if (!word) {
        //             ask();
        //             return;
        //         }

        //         if (word === ':quit') {
        //             const res = await api.giveUp();
        //             console.log('\nYou gave up!');
        //             console.log(`The word was: ${res.word}`);
        //             rl.close();
        //             return;
        //         }

        //         if (word === ':help') {
        //             console.log('\n📚 Available commands:');
        //             console.log(':quit - Give up and reveal the word');
        //             console.log(':help - Show this help\n');
        //             ask();
        //             return;
        //         }

        //         try {
        //             const res = await api.play(word);

        //             if (res.rank === 1) {
        //                 console.log('\nYOU WIN!');
        //                 console.log(`The word was: ${word}`);
        //                 console.log(`Guesses: ${res.rank}`);
        //                 rl.close();
        //             } else {
        //                 console.log(`📊 Rank: ${res.rank ?? '??'} | Distance: ${res.distance ?? '??'}`);
        //                 ask();
        //             }
        //         } catch (error) {
        //             console.log('❌ Invalid word or request failed');
        //             ask();
        //         }
        //     });
        // };

        // ask();
        process.stdin.on('keypress', (str, key) => {
        // console.log('Pressed:', key.name);
            let maxLength = 29
            GUESS+=key.name

            let filledGuess = GUESS

            if(filledGuess.length >= maxLength)  {
                drawTable();
                return;
            }
            for ( i=0; i<(maxLength - GUESS.length); i++) {
                filledGuess+=" "
            }

            GAME[2] = `\t║          | ${filledGuess}|         ║`
            // console.log(GUESS)
            drawTable();
            

        if (key.ctrl && key.name === 'c') process.exit();
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

function drawTable() {
    console.clear();
    GAME.forEach(line => {
        console.log(line)
    });
}
main();