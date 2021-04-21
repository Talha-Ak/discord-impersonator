# Discord Impersonator
> A Discord bot that allows users to impersonate others.

This repository is a mirror of a private repository hosting [the impersonator Discord bot](https://discord.com/oauth2/authorize?client_id=749282568733458545&scope=bot&permissions=537160768). This repository removes most details specific to our bot (like database urls and bot owner ids) but doesn't remove all specifics (like the help command).

This bot uses [Discord.js](https://discord.js.org/#/) to interact with the Discord API, and [Mongoose](https://mongoosejs.com/) to interact with the MongoDB database.

## User guide

Whenever someone joins your server, Impersonator will dress up as that person and say something that you wrote.

You're not limited to when somebody joins your server either. At any time you can pick anybody from your server, and pretend to say something as them. Impersonator will do it for you.

Impersonator also allows you to completely customise who you impersonate, letting you choose the name and profile picture of your liking. Use it for custom announcement messages, or just mess with your friends and pretend you're someone else.

* You can use `.implist` to view all your welcome messages
* You can use `.impadd` to add new ones
* You can use `.impsay` to impersonate someone in your server
* You can use `.impmake` to make a custom user to impersonate
* You can use `.imphelp` to see all the commands available
You will need *Manage Server* permissions to use the bot.

Ensure the bot has the *Manage Webhooks* permission to function properly.

## Technical info

This bot utilizes webhooks in order to allow users to send messages using the name and profile picture of another user in the same server.
It also allows for users to send messages under any name or avatar they want.

When a user joins a sever, an event is sent to the bot application. This queries the database to get an array of welcome messages of which one is randomly chosen. This randomly chosen message is sent through the webhook, using the user's name and profile picture.

### Setup

1. Create a new Discord application at https://discord.com/developers/applications
2. Go to the bot section and click on 'Add bot'
3. Copy the token generated and paste it into `.env`
4. Complete `config.js` and `.env`
5. Run `node index.js`

You *must* populate `.env` with your discord token. You must also populate `config.js`:
```js
module.exports = {
    logJoinsChannel: '<Channel ID for logging bot joins>',
    logChannel: '<Channel ID for logging errors/info>',
    inviteLink: '<Bot invite link>',
    webhookName: '<Name of default webhook in servers>',
    webhookAvatar: '<Image of default webhook in servers>',
    owners: ['<String array of bot owner ids - used for eval cmds>'],
    
    defaultSettings: {
        welcomeMsgs: ['<String array of default welcome messages to add>'],
    },
};
```

The database backend was originally hosted on MongoDB Atlas. If you're running this bot, you have two options:
1. Also host your database on MongoDB Atlas. Populate `.env` with the following:
```
DB=<Database name>
DB_USERNAME=<Username to access the db>
DB_PASSWORD=<Password to access the db>
```

2. Host MongoDB elsewhere. In `mongoose.js`, change the url to point to your database host.
