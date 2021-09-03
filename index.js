// Get references to node modules
const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

// Init Discord client
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_WEBHOOKS,
    ],
});

// Add db, commands and config to client
client.commands = new Collection();
client.cooldowns = new Collection();
client.mongoose = require('./database/mongoose');
client.config = require('./config');
require('./database/functions')(client);

// Register all events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(`Event ${event.name} registered`);
}

// Add all commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    console.log(`Command ${command.data.name} registered`);
}

// Log unhandled promise rejections.
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

client.mongoose.init();
client.login();
