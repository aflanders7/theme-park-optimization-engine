const puppeteer = require('puppeteer');
require('dotenv').config();
const fs = require('fs');

const COOKIES_PATH = './cookies.json';
const USER_DATA_DIR = './my-chrome-profile';

const DINING_URL = 'https://disneyworld.disney.go.com/dine-res/availability';
const LOGIN_URL = 'https://disneyworld.disney.go.com/login/';

const token = 'eyJraWQiOiJndWVzdGNvbnRyb2xsZXItLTE2MjAxOTM1NDQiLCJhbGciOiJFUzI1NiJ9.eyJqdGkiOiJPdDZFWTdBa2hzc28xLXdLRjFVcDJ3IiwiaXNzIjoiaHR0cHM6Ly9hdXRoLnJlZ2lzdGVyZGlzbmV5LmdvLmNvbSIsImF1ZCI6InVybjpkaXNuZXk6b25laWQ6cHJvZCIsInN1YiI6Ins3RkEwNUNCMS0yMDAzLTQwODktODQ2Mi00OEE2QkMxNDZBNUZ9IiwiaWF0IjoxNzQ2NjYxMzA3LCJuYmYiOjE3NDYyOTIzMDYsImV4cCI6MTc0Njc0NzcwNywiY2xpZW50X2lkIjoiVFBSLVdEVy1MQkpTLldFQi1QUk9EIiwibGlkIjoiYTljODlkZjUtNjg0YS00YWI1LWFlYWItYmUzM2Y3OWE0MzQyIiwiY2F0IjoiZ3Vlc3QifQ.GwrDtRk7EJuJwf2eDW6UwMGvgPxvzCtOqK161JUQut1XVJyvIqJWI1gUtFUJblXn7V9aR1Ku2WkWk3Wsrc49MA';
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

function getCookieHeaderFromFile() {
    const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH));
    return cookies
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ');
}

async function saveCookies(page) {
    const cookies = await page.cookies();
    fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));
    console.log('Cookies saved.');
}

const fetch = require('node-fetch'); // npm install node-fetch@2

async function fetchAvailabilityFromAPI() {
    const cookieHeader = getCookieHeaderFromFile();
    const date = '2025-05-15';
    const url = `https://disneyworld.disney.go.com/dine-res/api/availability/3/2025-05-15/00:00:00,23:59:59`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0', // Mimic browser User-Agent
            'Accept': 'application/json', // Ensuring we get the correct content type
            'Accept-Encoding': 'gzip, deflate, br', // Standard encoding
            'Accept-Language': 'en-US,en;q=0.9', // Preferred language
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
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
        headless: false,
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

    const isLoggedIn = false; // Replace with actual check later if needed

    if (!isLoggedIn) {
        await performLogin(page);
        await page.goto(DISNEY_URL, { waitUntil: 'networkidle2' });
    } else {
        console.log('Already logged in.');
    }

    await fetchAvailabilityFromAPI();

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
