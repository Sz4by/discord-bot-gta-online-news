# discord-bot-gta-online-news
A discord bot that gets data every hour from the Rockstar Newswire website, and sends a message to the Discord channel connected if a new article was found.

## Background
This small project is aiming to create a free to use Discord bot that is sending updates about GTA Online in Discord servers.
I saw some articles, reddit topics, many questions, and even another GitHub repository that were asking about or aiming to resolve this need,
however I didn't find any easy to use and free solutions, so I decided to develop my own.

## Requirements
- [Discord](https://discord.com/developers/) robot with Token ([Tutorial](https://youtu.be/qrYMZHdF8Po)). Make sure your bot is connected to your server already.
- [GitHub](https://github.com) account
- [Heroku](https://www.heroku.com/) account
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#download-and-install) to be installed on your computer

## Deployment
1. Create a new app on Heroku, and connect it to GitHub or use Heroku CLI. Here is a guide using GitHub: [link](https://youtu.be/8qIsRzV0Hpg). 
Make sure to add an environment variable called token in Heroku, and paste your Discord bot's token there.
2. Make sure you set up the Heroku CLI, and use the following command (don't forget to include your Heroku app name as argument):
```
$ heroku buildpacks:add jontewks/puppeteer
```
Or use the source code in this repository:
```
$ heroku buildpacks:add https://github.com/jontewks/puppeteer-heroku-buildpack.git
```
3. Restart your Dyno in Heroku or do a new release from GitHub / Heroku CLI
4. Check the Heroku logs, if everything is set up properly you should see a log that says 
```
Discord bot deployed!
```
5. If that is done, you will only need to go to your server, enter the channel where you want the bot to send the notifications to, and type %setup. 
The bot will respond you with:
```
GTA Online news will be sent to this channel!
```

And that's all there is to it. The bot will check the [Rockstar Newswire](https://www.rockstargames.com/newswire) website every hour, and send you an update if a new article 
that wasn't yet sent sent to your server before appears.

## Questions and feedback
Please note that this is an early version of the bot. You can contact me on Discord if you have any problems setting up the bot, or just questions in general. 
I'm also open to any feedbacks.

Discord:
```
Dj Duck#6546
```
