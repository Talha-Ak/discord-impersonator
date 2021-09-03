const { Client } = require('discord.js');

/**
 * Set the activity status for the bot & log status.
 * @param {Client} client
 */
const execute = async (client) => {
    client.user.setActivity('for /help', { type: 'WATCHING' });
    console.log(`Ready! Logged in as ${client.user.tag}`);
};

/**
 * Event when the bot successfully connects to Discord.
 */
module.exports = {
    name: 'ready',
    once: true,
    execute,
};
