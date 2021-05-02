
const Discord = require('discord.js');                      //Discord.js
const dcClient = new Discord.Client();
const fetch = require('node-fetch');                        //Node-fetch
const puppeteer = require('puppeteer');                     //Puppeteer
const url = 'https://www.rockstargames.com/newswire';
const MongoClient = require('mongodb').MongoClient;         //MongoDB
const uri = `mongodb+srv://discord-bot-gta-online-news:${process.env.MONGO_PW}@cluster0.mwpxk.mongodb.net/discord-bot?retryWrites=true&w=majority`;
let mongoDBClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// ------------- Functions -------------

const getSentArticles = async () => {
    let sentArticles;
    try {
        await mongoDBClient.connect().then(console.log("Connected to MongoDB"));
        sentArticles = await (await mongoDBClient.db("discord-bot").collection("gta-online-news-lock").find({}).toArray()).map(x => x.articleID);
        console.log(sentArticles);
    } catch (ex){
        console.error(ex);
    } finally {
        await mongoDBClient.close();
        console.log("MongoDB Connection closed")
    }
    return sentArticles;
}

const addSentArticle = async (title) => {
    try {
        mongoDBClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await mongoDBClient.connect().then(console.log("Connected to MongoDB, adding new item to collection"));
        sentArticles = await (await mongoDBClient.db("discord-bot").collection("gta-online-news-lock").find({}).toArray()).map(x => x.articleID);
        console.log(`Sent articles collection: ${sentArticles}`);
        await mongoDBClient.db("discord-bot").collection("gta-online-news-lock").insertOne({
            "articleID": title
        });
    } catch (ex){
        console.error(ex);
    } finally {
        await mongoDBClient.close();
        console.log("MongoDB Connection closed")
    }
}

const readArticles = async (browser) => {
    console.log(`Getting data from ${url}`);
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForTimeout(5000);
    const results = await page.evaluate(() => {
        let articles = document.querySelectorAll('._30cQN4q');
        const dataset = [...articles].map(a => ({
            innerText: a.innerText,
            innerHtml: a.innerHTML,
            href: a.href,
        }));
        return dataset;
    });
    return results;
}

const readLastGtaArticle = async (articles, browser) => {
    const gtaArticles = articles.filter(a => a.innerText.includes("GTA Online"));
    const latestArticle = gtaArticles[0];
    const articleUrl = latestArticle.href;
    const title = latestArticle.innerText.substring(latestArticle.innerText.indexOf("\n") + 1, latestArticle.innerText.lastIndexOf("\n"));
    const imgUrl = latestArticle.innerHtml.substring(latestArticle.innerHtml.indexOf("https://media"), latestArticle.innerHtml.indexOf(".jpg") + 4)
    const subtitles = await getArticleBody(latestArticle.href, browser);
    const descMain = subtitles[0];
    subtitles.shift();
    const subfields = [...subtitles.map(s => ` - ${s}`)]; //Remove first subtitle from the array and adds indentions to the remaining array items

    console.log(`Latest article title from Rockstar Newswire: ${title}`);
    return ({
        title: title,
        imgUrl: imgUrl,
        subtitles: subtitles,
        descMain: descMain,
        subfields: subfields,
        articleUrl: articleUrl
    })
}

const sendMessage = (dcChannel, title, descMain, subfields, articleUrl, imgUrl) => {
    let isSent = false;
    try {
        dcChannel.send({embed: {
            color: 3447003,
            author: {
                name: dcClient.user.username,
                icon_url: dcClient.user.avatarURL
            },
            title: title,
            description: `${descMain}\n\nMain updates this week:\n${subfields.join("\n")}`,
            url: articleUrl,
            image: {
                url: imgUrl
            },
            timestamp: new Date(),
            footer: 'https://i.imgur.com/wSTFkRM.png'
        }});
        console.log("Message was sent successfully!");
        isSent = true;
    } catch (error) {
        console.error(error)
    }
    return isSent;
}

//Gets GTA online articles from Rockstar Newswire, extracts data and send message in case the article wasn't yet sent to the channel.
const checkUpdates = async (dcChannel) => {
    let sentArticles = await getSentArticles();
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox','--disable-setuid-sandbox'],
        ignoreDefaultArgs: ['--disable-extensions']
    });
    const articles = await readArticles(browser);
    if (articles){
        const {title, imgUrl, subtitles, descMain, subfields, articleUrl} = await readLastGtaArticle(articles, browser);
        console.log(sentArticles.includes(title) ? "Article was already sent to the channel" : "Sending article to the Discord channel, and adding to memory.");
        if (!sentArticles.includes(title)) {       
            let isSent = sendMessage(dcChannel, title, descMain, subfields, articleUrl, imgUrl); //Send Discord message   
            if (isSent) addSentArticle(title); //Adding to MongoDB
        }
    } else {
        console.error('No data was exported from webpage');
    }
    await browser.close();
};

//Extracts h3 elements from latest GTA online article
const getArticleBody = async (url, browser) => {
    console.log("Getting latest article subtitles");
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForTimeout(10000);
    const res = await page.evaluate(() => {
        let subtitleElements = [...document.querySelectorAll('h3')];
        let subtitles = subtitleElements.map(s => s.innerHTML);
        return subtitles;
    });
    await browser.close();
    return res;
};

// ------------- Main -------------

console.log("Logging in to Discord");
dcClient.login(process.env.TOKEN);
dcClient.once('ready', () => {
    let dcChannel = dcClient.channels.cache.get(process.env.DC_CHANNEL_ID);
    console.log(`Setting up bot on channel ${dcChannel}`);
    checkUpdates(dcChannel);
    setInterval(() => checkUpdates(dcChannel), parseInt(process.env.INTERVAL_MS))
});