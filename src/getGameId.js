const fs = require('fs')
const puppeteer = require('puppeteer-core')

const chromePaths = [
    process.env.CHROME_PATH,

    // ===== System installs  =====
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',

    // ===== Snap =====
    '/snap/bin/chromium',
    '/snap/bin/google-chrome',

    // ===== Flatpak =====
    '/var/lib/flatpak/app/com.google.Chrome/current/active/files/bin/chrome',
    '/var/lib/flatpak/app/com.google.Chrome/current/active/files/bin/google-chrome',

    // ===== Arch =====
    '/usr/lib/chromium/chromium',

    // ===== macOS =====
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',

    // ===== Windows =====
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
].filter(Boolean)

// for (const p of chromePaths) {
//     try {
//         console.log(p, fs.existsSync(p))
//     } catch (e) {
//         console.log(p, 'ERROR', e.message)
//     }
// }
console.log("\n\t================================================")
console.log("\t  Retrieving game IDs! Please wait a few seconds ")
console.log("\t ================================================")
function findChromeExecutable() {
    for (const path of chromePaths) {
        if (fs.existsSync(path)) return path
    }
    throw new Error('No Chrome/Chromium executable found')
}

async function getContextoGameId(language) {
    const browser = await puppeteer.launch({
        executablePath: findChromeExecutable(),
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    })

    const page = await browser.newPage()

    try {
        await page.goto(`https://contexto.me/${language}`, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        })

        await page.waitForSelector('.info-bar', {
            timeout: 15000,
            visible: true
        })

        await new Promise(r => setTimeout(r, 1000))

        const gameId = await page.evaluate(() => {
            const infoBar = document.querySelector('.info-bar')
            if (!infoBar) return null

            const spans = infoBar.querySelectorAll('span')
            if (spans.length >= 2) return spans[1].textContent.trim()

            return null
        })

        if (!gameId) throw new Error('Game ID not found')

        return gameId

    } catch (error) {
        console.error('Error:', error.message)
        return null
    } finally {
        await browser.close()
    }
}

module.exports = { getContextoGameId }
