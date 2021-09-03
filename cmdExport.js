// This file is run independently of the bot.
// It is used to deploy slash commands either globally or targeted to a specific server.
// Any command file with a "private = true" will only be deployed to the specified testServer.
// botId and testServerId must be filled with your application ID and server ID.

// The application ID of the bot.
const botId = '';

// The server ID to deploy private commands to.
const testServerid = '';

// --- Setup

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('./config');
const fs = require('fs');

const publicCommands = [];
const privateCommands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    (command.private ? privateCommands : publicCommands).push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

// --- Deployment methods

pushAllPublic();
// pushAllPrivate();
// pushOnlyPrivate();

// ----------------------------

/**
 * Deploys all non-private slash commands globally.
 */
async function pushAllPublic() {
    try {
        console.log('Updating all public slash commands');

        await rest.put(Routes.applicationCommands(botId), { body: publicCommands });

        console.log('Updated all public slash commands');
    } catch (error) {
        console.error(error);
    }
}

/**
 * Deploys all slash commands to a specific server.
 */
async function pushAllPrivate() {
    try {
        console.log('Updating all commands privately');

        await rest.put(Routes.applicationGuildCommands(botId, testServerid), { body: [...publicCommands, ...privateCommands] });

        console.log('Updated all commands privately');
    } catch (error) {
        console.error(error);
    }
}

/**
 * Deploys all private slash commands to a specific server.
 */
async function pushOnlyPrivate() {
    try {
        console.log('Updating only private slash commands');

        await rest.put(Routes.applicationGuildCommands(botId, testServerid), { body: privateCommands });

        console.log('Updated private slash commands');
    } catch (error) {
        console.error(error);
    }
}
