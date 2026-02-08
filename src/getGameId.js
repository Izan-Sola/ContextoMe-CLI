const puppeteer = require('puppeteer');

async function getContextoGameId(language) {
    const browser = await puppeteer.launch({
        headless: 'new',  // Use new headless mode
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    });
    
    const page = await browser.newPage();
    
    try {
        await page.goto(`https://contexto.me/${language}`, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        
        // Wait longer for dynamic content
        await page.waitForSelector('.info-bar', { 
            timeout: 15000,
            visible: true 
        });
        
        // Simple delay alternative
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const gameId = await page.evaluate(() => {
            const infoBar = document.querySelector('.info-bar');
            if (!infoBar) return null;
            
            const spans = infoBar.querySelectorAll('span');
            if (spans.length >= 2) {
                return spans[1].textContent.trim();
            }
            return null;
        });
        
        if (!gameId) {
            throw new Error('Game ID not found');
        }
        return gameId;
        
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    } finally {
        await browser.close();
    }
}

module.exports = { getContextoGameId };