const prefix = "%";
let sentNews = [];
const intervalMs = 3600000; //Check website every hour
//Discord.js
const Discord = require('discord.js');
const client = new Discord.Client();
//Node-fetch
const fetch = require('node-fetch');
//Puppeteer
const puppeteer = require('puppeteer');
const url = 'https://www.rockstargames.com/newswire';

//Login to Discord
client.once('ready', () => console.log('Discord bot deployed!'));
client.login(process.env.token);

//On new message event it checks if the message is for the bot (based on the prefix), get the arguments and command. Performs the setup on '%setup' command.
client.on('message', message => {
    if (message.author.username !== client.user.username) console.log(`New message from ${message.author.username}: ${message.content}`)
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase(); 
    if (command === "setup") setupBot(message); //Set up Bot to send messages in channel.
});


// ------ Functions ------

//Confirms set up and starts checking the website based on the given interval.
setupBot = (message) => {
    console.log(`Setting up bot on channel ${message.channel.id}`)
    message.channel.send("GTA Online news will be sent to this channel!");
    checkUpdates(message);
    setInterval(() => checkUpdates(message), intervalMs)
};

//Gets GTA online articles from Rockstar Newswire, extracts data and send message in case the article wasn't yet sent to the channel.
checkUpdates = async (message) => {
    //Get data from Rockstar newswire
    console.log(`Getting data from ${url}`);
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox','--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForTimeout(5000);
    const res = await page.evaluate(() => {
        let articles = document.querySelectorAll('._30cQN4q');
        const dataset = [...articles].map(a => ({
            innerText: a.innerText,
            innerHtml: a.innerHTML,
            href: a.href,
        }));
        return dataset;
    });

    //Data validation
    if (res){
        const gtaArticles = res.filter(a => a.innerText.includes("GTA Online")); //Get GTA Online articles
        let latestArticle = gtaArticles[0]; //Get latest article
        //Get details of latest article
        let title = latestArticle.innerText.substring(latestArticle.innerText.indexOf("\n") + 1, latestArticle.innerText.lastIndexOf("\n"));
        let imgUrl = latestArticle.innerHtml.substring(latestArticle.innerHtml.indexOf("https://media"), latestArticle.innerHtml.indexOf(".jpg") + 4);
        let subtitles = await getArticleBody(latestArticle.href); //Get all subtitles from the article
        let descMain = subtitles[0];
        //Remove first subtitle from the array and adds indentions to the remaining array items
        subtitles.shift(); 
        let subfields = [...subtitles.map(s => ` - ${s}`)];

        //Check if message was sent already
        console.log(`Latest article title from Rockstar Newswire: ${title}`);
        if (sentNews.includes(title)) {
            console.log("Article was already sent to the channel");
        } else {
            //Add to memory and send message
            console.log("Sending article to the Discord channel, and adding to memory.")
            sentNews.push(title);
            message.channel.send({embed: {
                color: 3447003,
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                title: title,
                description: `${descMain}\n\nMain updates this week:\n${subfields.join("\n")}`,
                url: latestArticle.href,
                image: {
                    url: imgUrl
                },
                timestamp: new Date(),
                footer: 'https://i.imgur.com/wSTFkRM.png'
            }});
            console.log("Message was sent successfully!")
        }
    } else {
        console.error('No data was exported from webpage');
    }
    await browser.close();
};

//Extracts h3 elements from latest GTA online article
const getArticleBody = async (url) => {
    console.log("Getting latest article subtitles")
    const browser = await puppeteer.launch({headless: true});
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