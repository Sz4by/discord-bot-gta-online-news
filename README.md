# discord-bot-gta-online-news
Discord.JS application that fetches data from [Rockstar Newswire](https://www.rockstargames.com/newswire) website based on a regular base (as defined in config vars), formats the data in an embedded Discord message, and sends to the configured Discord channel.

## Requirements
- [Discord](https://discord.com/developers/) robot with Token ([Tutorial](https://youtu.be/qrYMZHdF8Po)). Make sure your bot is connected to your server already.
- [GitHub](https://github.com) account
- [Heroku](https://www.heroku.com/) account
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#download-and-install) to be installed on your computer
- MongoDB Atlas database collection to stored already sent articles (Heroku dynos restart every 24 hours, so this was designed to use an external and editable lock collection)

