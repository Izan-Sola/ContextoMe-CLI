const readline = require('readline')
const GameApi = require('./contextoAPI.js')
const { getContextoGameId } = require('./getGameId.mjs')

let LANGUAGE = "en"
let languageList = ["English   ", "Spanish   ", "Portuguese"]
let languages = ["en", "es", "pt"]
let languageOpt = "0"

let availableGames = ["Contexto"]
let gameOpt = "0"
let currentSetting = 0

let header = []
let entries = new Map()
let GUESS = ""
let lastGuess = ""
let filledGuess = ""
let DISTANCE = "100000"
let RANK = null
let GAME_ID = ""
let playing = false;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

const colors = {

    reset: "\x1b[0m",
    bold: "\x1b[1m",
    light_red: "\x1b[38;5;204m",
    bg_white: "\x1b[48;5;230m",
    bg_light_red: "\x1b[48;5;204m",
    bg_light_yellow: "\x1b[48;5;214m",
    bg_light_blue: "\x1b[48;5;110m",
    black: "\x1b[38;5;232m",
    bold: "\x1b[1m",
    reset: "\x1b[0m"
}

async function mainContexto() {
    try {
        if (process.stdin.isTTY) process.stdin.setRawMode(true)
        if (!GAME_ID) {
            console.error('Failed to get game ID')
            process.exit(1)
        }
        header.push(`\n\tStarting game...`)
        header[0] = `\n \t${colors.bold}╔════( Welcome to Contexto CLI. Game ID: ${GAME_ID} )════╗`
        header.push(`\t║¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯║`)
        header.push(`\t║          |                            |           ║`)
        header.push(`\t║          |¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯|           ║`)

        const api = GameApi(LANGUAGE, GAME_ID.replace('#', ''))




        drawContextoBoard()

        async function playWord(word) {
            try {
                const res = await api.play(word)

                if (res.rank === 1) {
                    console.log('\nYOU WIN!')
                    console.log(`The word was: ${word}`)
                    console.log(`Guesses: ${res.rank}`)
                    rl.close()
                } else {

                    if (res.distance < DISTANCE) DISTANCE = res.distance

                    if (DISTANCE == 0) {
                        winScreen()
                        return
                    }

                    let maxEntryWidth = 27
                    let fill = maxEntryWidth - (word.length + res.distance.toString().length + 1)

                    let bg = ""

                    if (res.distance > 0 && res.distance < 500) bg = colors.bg_light_blue
                    else if (res.distance > 500 && res.distance < 1000) bg = colors.bg_light_yellow
                    else if (res.distance > 1000) bg = colors.bg_light_red

                    entries.set(Number(res.distance), `\t║          |${bg}${colors.black} ${word}${" ".repeat(fill)}${res.distance.toString()} ${colors.reset}${colors.bold}|           ║`)
                    drawContextoBoard()
                }
            } catch (error) {
                console.log('Invalid word or request failed sldkngg', error)
            }
        }

        async function getHint() {
            try {
                DIST = Math.round(DISTANCE / 2)

                const res = await api.tip(DIST)
                DISTANCE = res.distance
                GUESS = res.word

                playWord(GUESS)

            } catch (error) {
                console.log('Invalid word or request failed :(', error)
            }
        }

        async function giveUp() {
            try {
                const res = await api.giveUp()

                console.clear()
                console.log(`${colors.bold}\t╔════════════════════════════╗`)
                console.log(`\t   You gave up! The word was: `)
                console.log(`\t\t   ${res.word.toUpperCase()} `)
                console.log(`\t╚════════════════════════════╝`)

            } catch (error) {

            }
        }

        process.stdin.on('keypress', (str, key) => {

            if (key.name === 'return') {

                switch (GUESS) {
                    case ":quit": rl.close(); break
                    case ":giveup": giveUp(); break
                    case ":hint": getHint(); break
                    default: playWord(GUESS)
                }
                GUESS = ""
                return

            } else if (key.name === 'backspace') {
                GUESS = GUESS.slice(0, -1)
            } else if (key.name != undefined && key.name.length == 1 && /^[a-zA-Z:]$/.test(key.name) || key.sequence == ':') {
                GUESS += (key.name == undefined) ? key.sequence : key.name
            }

            let maxLength = 27
            if (GUESS.length > maxLength) GUESS = GUESS.slice(0, maxLength)

            filledGuess = GUESS.padEnd(maxLength, " ")
            header[2] = `\t║          | ${colors.bold}${filledGuess}|           ║`
            drawContextoBoard()
        })

        rl.on('close', () => {
            console.log('\n bye ')
            process.exit(0)
        })

    } catch (error) {
        console.error('❌ Error:', error.message)
        process.exit(1)
    }
}

function drawContextoBoard() {

    console.clear()

    header.forEach(line => {
        console.log(line)
    })

    const sortedEntries = [...entries.entries()].sort((a, b) => a[0] - b[0])

    sortedEntries.forEach(([key, value]) => {
        console.log(value)
    })

    console.log(`\t╚═══════════════════════════════════════════════════╝`)
    console.log(`\tCommands -> :quit, :giveup, :hint, :settings`)
}
// mainContexto() 

function winScreen() {
    console.clear()
    console.log("winwniwnwnwiwnwnwinw")
}

async function start() {
    GAME_ID = await getContextoGameId(LANGUAGE)
    console.log(GAME_ID)
    console.clear()

    gameIdOptRow = `\t ║    Game ID -> ${(currentSetting == 1) ? colors.bg_white : ""
        } ${GAME_ID} ${colors.reset}${colors.bold}  `

    if (process.stdin.isTTY) process.stdin.setRawMode(true)

    drawOptions()
    if (!playing) {
        process.stdin.on('keypress', async (str, key) => {
            switch (key.name) {
                case "right": {
                    if (currentSetting == 0) {
                        if (languageOpt < languageList.length - 1) languageOpt++
                        else languageOpt = 0
                    }
                    LANGUAGE = languages[languageOpt]
                    GAME_ID = await getContextoGameId(LANGUAGE)
                    break
                }
                case "left": {
                    if (currentSetting == 0) {
                        if (languageOpt > 0) languageOpt--
                        else languageOpt = languageList.length - 1
                    }
                    LANGUAGE = languages[languageOpt]
                    GAME_ID = await getContextoGameId(LANGUAGE)
                    break
                }
                case "down": {
                    if (currentSetting < 2) currentSetting++
                    else currentSetting = 0
                    break
                }
                case "up": {
                    if (currentSetting > 0) currentSetting--
                    else currentSetting = 2
                    break
                }
                case "return": {
                    process.stdin.removeAllListeners('keypress');
                    if (gameOpt == 0) {
                        console.clear()
                        drawContextoBoard()
                        mainContexto()                                   
                    }
      
                    return;
                    // playing = true
                }
            }
            gameIdOptRow = `\t ║    Game ID -> ${(currentSetting == 2) ? colors.bg_white : ""
                } ${GAME_ID} ${colors.reset}${colors.bold}  `
            drawOptions()
        })
    }


}

let gameIdOptRow = ""

function drawOptions() {
    console.clear()
    console.log(`\t${colors.bold} ╔═══{ Choose your settings }═══╗ `)
    console.log(`\t ║                              ║`)
    console.log(`\t ║   ${colors.reset}Languages: ES, EN, PT${colors.bold}      ║`)
    console.log(`\t ║   ${colors.reset}Games: Contexto      ${colors.bold}      ║`)
    console.log(`\t ║                              ║`)
    console.log(`\t ║    Language -> ${(currentSetting == 0) ? colors.bg_white : ""
        } ${languageList[languageOpt]} ${colors.reset}${colors.bold}  ║`)
    console.log(`\t ║    Game -> ${(currentSetting == 1) ? colors.bg_white : ""
        } ${availableGames[gameOpt]} ${colors.reset}${colors.bold}        ║`)
    console.log(gameIdOptRow)
    console.log(`\t ╚══════════════════════════════╝ ${colors.reset}`)
    console.log(`\n\t       Keys: Move, Enter: Play `) //
    console.log(`       ID also varies with language, wait for it!`)
    
}

start()