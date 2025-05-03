const puppeteer = require('puppeteer');
require('dotenv').config();
const fs = require('fs');

const COOKIES_PATH = './cookies.json';
const USER_DATA_DIR = './my-chrome-profile';

const DINING_URL = 'https://disneyworld.disney.go.com/dine-res/availability';
const LOGIN_URL = 'https://disneyworld.disney.go.com/login/';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadCookies(page) {
    if (fs.existsSync(COOKIES_PATH)) {
        const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH));
        await page.setCookie(...cookies);
        console.log('Cookies loaded.');
    }
}

async function saveCookies(page) {
    const cookies = await page.cookies();
    fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));
    console.log('Cookies saved.');
}

async function disableDetection(page) {
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
        });
    });
}

async function performLogin(page) {
    console.log('Logging in...');
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' });

    const iframeHandle = await page.waitForSelector('iframe#oneid-iframe', { timeout: 10000 });
    const frame = await iframeHandle.contentFrame();
    if (!frame) throw new Error('Could not access login iframe');

    await frame.waitForSelector('#InputIdentityFlowValue', { timeout: 10000 });
    await frame.type('#InputIdentityFlowValue', process.env.DISNEY_EMAIL);
    await frame.click('#BtnSubmit');

    await frame.waitForSelector('#InputPassword', { timeout: 10000 });
    await frame.type('#InputPassword', process.env.DISNEY_PASSWORD);
    await frame.click('#BtnSubmit');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await saveCookies(page);
}

async function loginAndScrape() {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
        ],
        userDataDir: USER_DATA_DIR,
    });

    const page = await browser.newPage();
    await disableDetection(page);
    await loadCookies(page);
    await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36'
    );

    await page.goto(DINING_URL, { waitUntil: 'networkidle2' });

    const isLoggedIn = true; // Replace with actual check later if needed

    if (!isLoggedIn) {
        await performLogin(page);
        await page.goto(DISNEY_URL, { waitUntil: 'networkidle2' });
    } else {
        console.log('Already logged in.');
    }

    console.log('At dining reservation page');
    await sleep(15000);

    // Set party size
    await page.click('#count-selector4');
    console.log('Party size selected');
    await sleep(3000);

    // Select date
    await page.click('a[data-date="2025-05-04"]');
    console.log('Date selected');
    await sleep(3000);

    // Select time
    await page.click('#unique_id_time_All\\ Day');
    console.log('Time selected');
    await sleep(3000);

    // Scrape button data
    const wdprButtons = await page.$$eval('wdpr-button', buttons =>
        buttons
          .map(btn => btn.getAttribute('aria-label')?.trim())
          .filter(label => label && label.length > 0)
    );

    console.log('Found times:', wdprButtons);

    await browser.close();
}

loginAndScrape().catch(console.error);
