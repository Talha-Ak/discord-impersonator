# Discord Impersonator

> A Discord bot that allows users to impersonate others.

<img src="https://user-images.githubusercontent.com/30045102/132047312-ce7c9ea4-d8e4-4c32-85c4-62dd2bd1624e.gif" alt="Demo of /say command" title="Demo of /say command" width="450px" align="right">

This repository is a mirror of a private repository hosting [the impersonator Discord bot](https://discord.com/api/oauth2/authorize?client_id=749282568733458545&permissions=536898624&scope=bot%20applications.commands). This repository removes most details specific to our bot (like database urls, user content encryption, non-interaction based command handling).

This bot has been updated to utilise Discord's new 'Interaction' based API, namely [Slash Commands](https://discord.com/developers/docs/interactions/application-commands#slash-commands). Slash commands provide the benefit of command discoverability, as well as moving responsiblity of user input validation to the Discord client and servers.

<br clear="right">

This bot uses [Discord.js](https://discord.js.org/#/) to interact with the Discord API, and [Mongoose](https://mongoosejs.com/) to interact with the MongoDB database.

## User guide

Whenever someone joins your server, Impersonator will dress up as that person and say something that you wrote.

You're not limited to when somebody joins your server either. At any time you can pick anybody from your server, and pretend to say something as them. Impersonator will do it for you.

Impersonator also allows you to completely customise who you impersonate, letting you choose the name and profile picture of your liking. Use it for custom announcement messages, or just mess with your friends and pretend you're someone else.

- You can use `/list` to view all your welcome messages
- You can use `/add` to add new ones
- You can use `/say` to impersonate someone in your server
- You can use `/make` to make a custom user to impersonate
- You can use `/help` to see all the commands available

You will need _Manage Server_ permissions to initially use the bot.

Ensure the bot has the _Manage Webhooks_ permission to function properly.

## Technical info

This bot utilizes webhooks in order to allow users to send messages using the name and profile picture of another user in the same server.
It also allows for users to send messages under any name or avatar they want.

When a user joins a server, an event is sent to the bot application. The app queries the database to get an array of welcome messages of which one is randomly chosen. This randomly chosen message is sent through the server's webhook, using the user's name and profile picture.

### Setup

1. Create a new Discord application at https://discord.com/developers/applications
2. Go to the bot section and click on 'Add bot'
3. Copy the token generated and paste it into `DISCORD_TOKEN` at `.env.example`
4. Paste your MongoDB database connection URL into `DATABASE_URL` at `.env.example`
5. Rename `.env.example` to `.env`
6. Go to the OAuth2 section and generate an invite link for the bot. Ensure the `bot` and `applications.commands` scopes are checked, and the _Manage Webhooks_ bot permission is checked at a minimum
7. Complete `config.js`

```typescript
const botInviteUrl: string = 'Your bot invite link';

...

const owners: string[] = ['Your owner IDs', 'Used for sensitive commands'];

...

const supportServerUrl: string = 'Your server invite link';

const webhookDefaults: { name: string; avatar: string } = {
  name: 'Default name for server webhooks',
  avatar: 'Default image URL for server webhooks',
};

const welcomeDefaults: string[] = ['Default server welcome messages'];
```

8. If you want to utilize sensitive commands like `/eval`, add your (private!) server's ID to line 79 inside `src/structures/Client.ts`. Otherwise, remove the placeholder ID

```typescript
...
this.commands.set(command.info.name, command);
}

// ADD SERVER ID TO THIS LINE                            vvvvvvvvvvvv
this.on('ready', async () => await this.registerCommands('1234567890'));

// Register button interactions
...
```

9. Run `node index.js`
