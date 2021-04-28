//Puppeteer
const puppeteer = require('puppeteer');

const getArticleBody = async (url) => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForTimeout(10000);

    //Get data
    const res = await page.evaluate(() => {
        let subtitleElements = [...document.querySelectorAll('h3')];
        let subtitles = subtitleElements.map(s => s.innerHTML);
        return subtitles;
    });
    await browser.close();
    return res;
}



asd = async () => {
    let articles = await getArticleBody("https://www.rockstargames.com/newswire/article/9k1a9k875488ao/triple-rewards-on-casino-story-missions-and-rumors-of-diamonds-in-the-")
    console.log(articles);
} 

asd();