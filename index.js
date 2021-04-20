// Get references to node modules
const Discord = require('discord.js');
const fs = require('fs');
require('dotenv-flow').config();

// Init Discord client
const client = new Discord.Client({ ws: { intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_WEBHOOKS'] } });

// Add db, commands and config to client
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();
client.mongoose = require('./database/mongoose');
client.config = require('./config');
require('./database/functions')(client);

// Register all events
fs.readdir('./events/', async (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith('.js')) return;
        const evnt = require(`./events/${file}`);
        const evntName = file.split('.')[0];
        console.log(`Loaded ${evntName} event`);
        client.on(evntName, evnt.bind(null, client));
    });
});

// Add all commands
fs.readdir('./commands/', async (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith('.js')) return;
        const properties = require(`./commands/${file}`);
        const cmdName = file.split('.')[0];
        console.log(`Loaded ${cmdName} cmd`);
        client.commands.set(cmdName, properties);
    });
});

// Log unhandled promise rejections.
process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

client.mongoose.init();
client.login();
